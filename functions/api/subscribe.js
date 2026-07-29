/**
 * /functions/api/subscribe.js — Secure MailerLite subscriber proxy
 * (Cloudflare Pages Function)
 *
 * Cloudflare Pages Functions use a different runtime than Vercel/Node:
 *   - Handlers are named onRequestPost / onRequestOptions / onRequest, not
 *     a single default-exported (req, res) function.
 *   - You receive a `context` object with { request, env, params, ... } —
 *     there is no `res.status().json()`; you construct and return a
 *     standard Web API Response object instead.
 *   - Environment variables live on context.env, not process.env.
 *
 * Environment variables required (Cloudflare Pages dashboard → your
 * project → Settings → Environment variables — set for BOTH "Production"
 * and "Preview", and redeploy after adding them):
 *   MAILERLITE_API_KEY  — your MailerLite API key (Settings → Integrations → API)
 *   MAILERLITE_GROUP_ID — the subscriber group this assessment should feed into
 *   ALLOWED_ORIGIN      — your live domain, e.g. https://colicprotocol.baby
 *
 * If the existing colicprotocol.baby MailerLite setup already has a
 * dedicated "quiz" group ID (Master Document v11 references separate group
 * IDs for checklist vs. quiz), use that group ID here rather than creating
 * a new one, so this doesn't fragment an already-working list.
 *
 * The API key is NEVER sent to the browser. All requests go through this
 * function, which runs only on Cloudflare's servers.
 *
 * REQUIRED MailerLite custom fields — create these once in MailerLite under
 * Subscribers → Fields → Create field (type: Text) before this data will
 * save correctly:
 *   name, colic_type, quiz_status, utm_source, utm_medium, utm_campaign, utm_term, utm_content
 *
 * quiz_status is what makes the two-phase capture work: this endpoint gets
 * called once at the very start of the quiz (name + email only, before any
 * question is shown, quiz_status="started", colic_type=""), and again at
 * the end once a result is determined (quiz_status="completed",
 * colic_type=the actual result). Build two MailerLite automations on the
 * SAME group: one triggered by quiz_status=started that waits, say, 20
 * minutes and only sends if the subscriber has NOT since been updated to
 * completed (MailerLite's "condition" step on group/field state handles
 * this), and one triggered by quiz_status=completed that sends the actual
 * result email. That combination is what "catches" an abandoned quiz
 * without a second, separate integration.
 */

function corsHeaders(allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(status, body, allowedOrigin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(allowedOrigin),
    },
  });
}

// Handle CORS pre-flight
export async function onRequestOptions(context) {
  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return new Response(null, { status: 204, headers: corsHeaders(allowed) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const allowed = env.ALLOWED_ORIGIN || '*';

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json(400, { error: 'Invalid JSON body' }, allowed);
  }

  // ── Input validation ──────────────────────────────────────────────────
  const { name, email, colic_type, quiz_status, website, consent, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = body || {};

  // Honeypot: real users never populate a hidden "website" field.
  // Silently accept (200) so bots don't learn the check exists, but skip
  // the actual MailerLite call so junk never reaches your list.
  if (typeof website === 'string' && website.trim().length > 0) {
    return json(200, { success: true }, allowed);
  }

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return json(400, { error: 'Name is required' }, allowed);
  }

  if (!email || typeof email !== 'string') {
    return json(400, { error: 'Email is required' }, allowed);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return json(400, { error: 'Invalid email address' }, allowed);
  }

  // GUT, NERV, ACOU are the three root-cause systems the assessment sorts
  // into. Keep this list in sync with the RESULTS object in quiz.html.
  const validTypes = ['GUT', 'NERV', 'ACOU', ''];
  const cleanType = typeof colic_type === 'string' ? colic_type.trim() : '';
  if (!validTypes.includes(cleanType)) {
    return json(400, { error: 'Invalid colic type' }, allowed);
  }

  // 'started' = captured at the top of the quiz, before any question is
  // answered, colic_type is always '' at this point. 'completed' = captured
  // after a result is determined. Anything else (e.g. the checklist page,
  // which also POSTs here) defaults to 'started' so existing callers that
  // don't send this field don't break.
  const validStatuses = ['started', 'completed'];
  const cleanStatus = validStatuses.includes(quiz_status) ? quiz_status : 'started';
  if (cleanStatus === 'completed' && !cleanType) {
    return json(400, { error: 'colic_type is required when quiz_status is completed' }, allowed);
  }

  // Consent gate: defense-in-depth alongside the required checkbox in
  // quiz.html. A request reaching this endpoint without consent=true either
  // bypassed the UI (bot/script) or is a bug, either way, don't subscribe.
  if (consent !== true) {
    return json(400, { error: 'Consent is required to subscribe' }, allowed);
  }

  // UTM fields are optional and low-risk, but still sanitize: cap length
  // and strip anything that isn't plain text, since these came from a URL
  // query string an attacker could hand-craft.
  const cleanUTM = (val) => {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, 100).replace(/[<>"'`]/g, '');
  };
  const utm = {
    utm_source: cleanUTM(utm_source),
    utm_medium: cleanUTM(utm_medium),
    utm_campaign: cleanUTM(utm_campaign),
    utm_term: cleanUTM(utm_term),
    utm_content: cleanUTM(utm_content),
  };

  // Logged (not stored) audit trail: visible in Cloudflare Pages' function
  // logs (Workers Logs / Real-time Logs) if you ever need to demonstrate
  // when consent was captured for a given signup.
  console.log(`[subscribe] consent given at ${new Date().toISOString()} for ${email.trim().toLowerCase()}, status=${cleanStatus}, type=${cleanType || 'none'}`);

  // ── Config check ────────────────────────────────────────────────────
  const API_KEY = env.MAILERLITE_API_KEY;
  const GROUP_ID = env.MAILERLITE_GROUP_ID;

  if (!API_KEY || !GROUP_ID) {
    console.error('[subscribe] Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_ID');
    return json(500, { error: 'Server configuration error' }, allowed);
  }

  // ── Call MailerLite ─────────────────────────────────────────────────
  try {
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        fields: {
          name: name.trim(),
          colic_type: cleanType,
          quiz_status: cleanStatus,
          ...utm,
        },
        groups: [GROUP_ID],
        status: 'active',
      }),
    });

    const data = await mlRes.json();

    // 422 = subscriber already exists, treat as success. Any other
    // non-OK status is logged in FULL (not just the code) so a
    // misconfigured or not-yet-created custom field shows up clearly in
    // Cloudflare's function logs instead of failing silently.
    if (!mlRes.ok && mlRes.status !== 422) {
      console.error('[subscribe] MailerLite error:', mlRes.status, JSON.stringify(data));
      return json(502, { error: 'Subscription failed, please try again' }, allowed);
    }

    return json(200, { success: true }, allowed);

  } catch (err) {
    console.error('[subscribe] Unexpected error:', err);
    return json(500, { error: 'Internal server error' }, allowed);
  }
}

// Any method other than POST/OPTIONS
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);
  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return json(405, { error: 'Method not allowed' }, allowed);
}
