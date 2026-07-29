/**
 * /functions/api/subscribe.js — Secure MailerLite subscriber proxy
 * (Cloudflare Pages Function)
 *
 * Environment variables required (Cloudflare Pages → Settings → Environment
 * variables — set for BOTH "Production" and "Preview", redeploy after adding):
 *   MAILERLITE_API_KEY  — MailerLite API key (Settings → Integrations → API)
 *   MAILERLITE_GROUP_ID — subscriber group this assessment feeds into
 *   ALLOWED_ORIGIN      — your live domain, e.g. https://colicprotocol.baby
 *
 * REQUIRED MailerLite custom fields — create once under Subscribers → Fields
 * → Create field (type: Text) before this data will save correctly:
 *   name, colic_type, colic_type_detail, quiz_status, confidence_pct,
 *   baby_age_weeks, assessment_id, lead_source, quiz_version,
 *   purchase_status, utm_source, utm_medium, utm_campaign, utm_term,
 *   utm_content
 *
 * Two-phase capture: quiz.html calls this endpoint twice.
 *   1. On quiz start: quiz_status="started", colic_type="Unassigned"
 *   2. On result:     quiz_status="completed", colic_type=full type name
 * Build two MailerLite automations on the same group — one for started
 * (abandoned-quiz recovery) and one for completed (result delivery).
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

// ── colic_type normalisation ─────────────────────────────────────────────
// quiz.html v2 sends full English strings; the original validation only
// accepted short codes. This map accepts both so older callers don't break.
const COLIC_TYPE_MAP = {
  'GUT':  'GUT',
  'NERV': 'NERV',
  'ACOU': 'ACOU',
  '':     '',
  'Gut Microbiome Imbalance':    'GUT',
  'Nervous System Dysregulation': 'NERV',
  'Acoustic Environment Overload': 'ACOU',
  'Unassigned': '',
};

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

  const {
    name, email, colic_type, colic_type_detail, quiz_status,
    website, consent,
    confidence_pct, baby_age_weeks, assessment_id, lead_source,
    quiz_version, purchase_status,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  } = body || {};

  // Honeypot
  if (typeof website === 'string' && website.trim().length > 0) {
    return json(200, { success: true }, allowed);
  }

  // Required fields
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

  // Normalise colic_type — accepts both short codes and the full strings
  // quiz.html sends. Anything not in the map is rejected.
  const rawType = typeof colic_type === 'string' ? colic_type.trim() : '';
  if (!Object.prototype.hasOwnProperty.call(COLIC_TYPE_MAP, rawType)) {
    return json(400, { error: 'Invalid colic type' }, allowed);
  }
  const cleanType = COLIC_TYPE_MAP[rawType];

  const validStatuses = ['started', 'completed'];
  const cleanStatus = validStatuses.includes(quiz_status) ? quiz_status : 'started';
  if (cleanStatus === 'completed' && !cleanType) {
    return json(400, { error: 'colic_type is required when quiz_status is completed' }, allowed);
  }

  if (consent !== true) {
    return json(400, { error: 'Consent is required to subscribe' }, allowed);
  }

  // Sanitise helpers
  const cleanStr = (val, maxLen = 200) => {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen).replace(/[<>"'`]/g, '');
  };
  const cleanNum = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? String(n) : '';
  };

  const utm = {
    utm_source:   cleanStr(utm_source,   100),
    utm_medium:   cleanStr(utm_medium,   100),
    utm_campaign: cleanStr(utm_campaign, 100),
    utm_term:     cleanStr(utm_term,     100),
    utm_content:  cleanStr(utm_content,  100),
  };

  console.log(
    `[subscribe] consent at ${new Date().toISOString()} ` +
    `email=${email.trim().toLowerCase()} status=${cleanStatus} type=${cleanType || 'none'}`
  );

  const API_KEY  = env.MAILERLITE_API_KEY;
  const GROUP_ID = env.MAILERLITE_GROUP_ID;

  if (!API_KEY || !GROUP_ID) {
    console.error('[subscribe] Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_ID');
    return json(500, { error: 'Server configuration error' }, allowed);
  }

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
          name:              name.trim(),
          colic_type:        cleanType,
          colic_type_detail: cleanStr(colic_type_detail),
          quiz_status:       cleanStatus,
          confidence_pct:    cleanNum(confidence_pct),
          baby_age_weeks:    cleanNum(baby_age_weeks),
          assessment_id:     cleanStr(assessment_id),
          lead_source:       cleanStr(lead_source),
          quiz_version:      cleanStr(quiz_version, 20),
          purchase_status:   cleanStr(purchase_status, 50),
          ...utm,
        },
        groups: [GROUP_ID],
        status: 'active',
      }),
    });

    const data = await mlRes.json();

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

export async function onRequest(context) {
  if (context.request.method === 'POST')    return onRequestPost(context);
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);
  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return json(405, { error: 'Method not allowed' }, allowed);
}
