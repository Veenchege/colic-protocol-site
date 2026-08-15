/**
 * /functions/api/midnight-subscribe.js
 * Cloudflare Pages Function → MailerLite Subscriber Proxy
 * for the Midnight Protocol interactive checklist.
 *
 * Deliberately a SIBLING of /functions/api/subscribe.js, not a
 * merge into it. The two share the same MailerLite account, the
 * same API key, and the same small helpers (cleanStr, cleanNum,
 * corsHeaders, the honeypot + consent checks) — copied below
 * rather than imported, so this file has zero ability to change
 * the quiz's already-working behavior. What's genuinely new here
 * (the repeat-visit counter, the non-completion stage tracking)
 * lives only in the file that needs it.
 *
 * ENV VARS REQUIRED (Cloudflare Pages → Settings → Environment variables):
 *   MAILERLITE_API_KEY        — same key subscribe.js already uses
 *   MAILERLITE_GROUP_MIDNIGHT — a NEW group id, separate from
 *                                MAILERLITE_GROUP_ID (the quiz's group).
 *                                This is the 195728613189879425 group.
 *   ALLOWED_ORIGIN             — optional, defaults to '*', same as subscribe.js
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

// Same three canonical labels quiz.html's RESULTS object and
// subscribe.js's VALID_COLIC_TYPES already use, plus 'Unassigned'
// for "not sure" — reusing the exact strings on purpose, so a
// MailerLite record built partly by the quiz and partly by the
// checklist agrees with itself instead of drifting into two
// vocabularies for the same underlying field.
const VALID_COLIC_TYPES = [
  '',
  'Unassigned',
  'Gut Microbiome Imbalance',
  'Nervous System Dysregulation',
  'Acoustic Environment Overload',
];

const VALID_CHECKLIST_STATUS = ['started', 'in_progress', 'completed'];

const VALID_STAGES = [
  'welcome',
  'colic_type',
  'emergency_shown',
  'environment',
  'tiger_hold',
  'gas_release',
  'final',
  'bridge',
];

const VALID_OUTCOMES = ['', 'good', 'mid', 'low'];

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
  } catch {
    return json(400, { error: 'Invalid JSON body' }, allowed);
  }

  const {
    name,
    email,
    website,               // honeypot
    consent,
    baby_age_weeks,
    colic_type,
    colic_type_detail,
    assessment_id,
    lead_source,
    checklist_version,
    purchase_status,
    checklist_status,
    checklist_last_stage,
    environment_outcome,
    tiger_hold_outcome,
    final_outcome,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  } = body || {};

  // Honeypot spam trap — identical pattern to subscribe.js
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

  const cleanEmail = email.trim().toLowerCase();

  const cleanType =
    typeof colic_type === 'string' && VALID_COLIC_TYPES.includes(colic_type.trim())
      ? colic_type.trim()
      : '';

  const cleanStatus = VALID_CHECKLIST_STATUS.includes(checklist_status)
    ? checklist_status
    : 'started';

  const cleanStage = VALID_STAGES.includes(checklist_last_stage)
    ? checklist_last_stage
    : 'welcome';

  // Consent required — same hard rule as the quiz
  if (consent !== true) {
    return json(400, { error: 'Consent is required to subscribe' }, allowed);
  }

  const cleanStr = (val, maxLen = 200) => {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen).replace(/[<>"'`]/g, '');
  };
  const cleanNum = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? String(n) : '';
  };
  const cleanOutcome = (val) => (VALID_OUTCOMES.includes(val) ? val : '');

  const utm = {
    utm_source: cleanStr(utm_source, 100),
    utm_medium: cleanStr(utm_medium, 100),
    utm_campaign: cleanStr(utm_campaign, 100),
    utm_term: cleanStr(utm_term, 100),
    utm_content: cleanStr(utm_content, 100),
  };

  console.log(
    `[midnight-subscribe] ${new Date().toISOString()} email=${cleanEmail} ` +
    `status=${cleanStatus} stage=${cleanStage} type=${cleanType || 'none'}`
  );

  const API_KEY = env.MAILERLITE_API_KEY;
  const GROUP_ID = env.MAILERLITE_GROUP_MIDNIGHT;

  if (!API_KEY || !GROUP_ID) {
    console.error('[midnight-subscribe] Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_MIDNIGHT');
    return json(500, { error: 'Server configuration error' }, allowed);
  }

  // ----------------------------------------------------------------
  // Repeat-visit counter. Only worth the extra round trip on the
  // very first call of a session ("started"), not on every stage
  // update — otherwise a single 15-screen run would cost 15 GET+POST
  // pairs against a rate-limited endpoint for no added benefit.
  // MailerLite's subscriber-upsert POST is documented as additive
  // (omitted fields/groups are left alone, not wiped), so the stage
  // updates later in this same run can safely POST only what changed.
  // ----------------------------------------------------------------
  let runCount = 1;
  let firstStartedAt = new Date().toISOString();

  if (cleanStatus === 'started') {
    try {
      const lookup = await fetch(
        `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(cleanEmail)}`,
        { headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' } }
      );
      if (lookup.ok) {
        const existing = await lookup.json();
        const f = (existing && existing.data && existing.data.fields) || {};
        const prevCount = Number(f.checklist_run_count) || 0;
        runCount = prevCount + 1;
        firstStartedAt = f.checklist_first_started_at || firstStartedAt;
      }
    } catch (err) {
      // Lookup failing should never block the actual subscribe call —
      // worst case a repeat visitor's count under-reports as 1.
      console.error('[midnight-subscribe] run-count lookup failed:', err);
    }
  }

  const nowIso = new Date().toISOString();

  const fields = {
    name: name.trim(),
    baby_age_weeks: cleanNum(baby_age_weeks),
    assessment_id: cleanStr(assessment_id, 40),
    lead_source: cleanStr(lead_source),
    checklist_version: cleanStr(checklist_version, 20) || '1.0',
    purchase_status: cleanStr(purchase_status, 50) || 'pending',
    checklist_status: cleanStatus,
    checklist_last_stage: cleanStage,
    checklist_last_updated_at: nowIso,
    ...utm,
  };

  // Only set colic_type / colic_type_detail when this call actually
  // carries a value — an empty string here would, per the "not sure"
  // path, correctly overwrite a stale guess with Unassigned, but a
  // plain stage-progress ping (environment check, tiger hold check)
  // has nothing new to say about type and shouldn't touch the field.
  if (cleanType || colic_type === '') {
    fields.colic_type = cleanType || 'Unassigned';
    fields.colic_type_detail = cleanStr(colic_type_detail);
  }

  const eo = cleanOutcome(environment_outcome);
  const to = cleanOutcome(tiger_hold_outcome);
  const fo = cleanOutcome(final_outcome);
  if (eo) fields.environment_outcome = eo;
  if (to) fields.tiger_hold_outcome = to;
  if (fo) fields.final_outcome = fo;

  if (cleanStatus === 'started') {
    fields.checklist_run_count = String(runCount);
    fields.checklist_first_started_at = firstStartedAt;
    fields.checklist_last_started_at = nowIso;
  }

  try {
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        email: cleanEmail,
        fields,
        groups: [GROUP_ID],
        status: 'active',
      }),
    });

    const data = await mlRes.json();

    if (!mlRes.ok && mlRes.status !== 422) {
      console.error('[midnight-subscribe] MailerLite error:', mlRes.status, JSON.stringify(data));
      return json(502, { error: 'Subscription failed, please try again' }, allowed);
    }

    return json(200, {
      success: true,
      status: cleanStatus,
      stage: cleanStage,
      run_count: cleanStatus === 'started' ? runCount : undefined,
    }, allowed);

  } catch (err) {
    console.error('[midnight-subscribe] Unexpected error:', err);
    return json(500, { error: 'Internal server error' }, allowed);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);
  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return json(405, { error: 'Method not allowed' }, allowed);
}
