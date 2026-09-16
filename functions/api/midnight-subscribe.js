/**
 * /functions/api/midnight-subscribe.js
 * Cloudflare Pages Function -> MailerLite + Supabase, for the
 * Midnight Protocol interactive tool specifically. Deliberately a
 * sibling of subscribe.js, not a shared route, so the quiz's already-
 * working logic is never touched by anything built for this tool.
 *
 * FIELD-CLOBBER FIX, READ BEFORE CHANGING THE PAYLOAD BELOW:
 * MailerLite's subscriber upsert is non-destructive only for fields
 * you omit from the request entirely. A field you DO include, even as
 * an empty string, overwrites whatever was there before (confirmed
 * against MailerLite's own API docs, not assumed). Midnight Protocol
 * can legitimately have no colic_type (the visitor picked "not sure",
 * or never got asked because they arrived without a quiz handoff). If
 * this file sent colic_type: '' in that case, and the same email
 * already has a real diagnosis from the quiz, this call would erase
 * it in MailerLite. The fix: colic_type is only added to the outgoing
 * fields object when it's a real, non-empty value. See buildFields()
 * below, do not "simplify" this back to always sending the key.
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
    headers: { 'Content-Type': 'application/json', ...corsHeaders(allowedOrigin) },
  });
}

// Same three canonical labels quiz.html's RESULTS object and
// subscribe.js's VALID_COLIC_TYPES use. 'UNSURE' from the tool's own
// state maps to '' before it ever reaches this file (see
// midnight-protocol.html's TYPE_MAP handling), so this list matches
// subscribe.js's list exactly, no fourth value to reconcile.
const VALID_COLIC_TYPES = [
  '',
  'Unassigned',
  'Gut Microbiome Imbalance',
  'Nervous System Dysregulation',
  'Feeding Mechanics',
];

const VALID_CHECKLIST_STATUS = ['started', 'in_progress', 'completed'];

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
    website, // honeypot
    consent,
    baby_age_weeks,
    colic_type,
    colic_type_detail,
    colic_type_confidence,
    assessment_id,
    lead_source,
    checklist_status,
    checklist_last_stage,
    checklist_version,
    environment_outcome,
    tiger_hold_outcome,
    final_outcome,
    // Dwell/timer fields. These were being computed correctly client-side
    // (midnight-protocol.html's submitOutcome()) but were never destructured
    // here, so they were silently dropped on every request — this is why
    // all four dwell-time columns showed NULL for every row. Fixed by
    // actually pulling them out of the body below.
    environment_dwell_seconds,
    tiger_hold_dwell_seconds,
    gas_release_dwell_seconds,
    final_dwell_seconds,
    // New: active seconds the Tiger Hold stopwatch actually ran, distinct
    // from tiger_hold_dwell_seconds (which is just time-on-screen). Lets
    // duration-vs-outcome be analysed later. Requires a
    // tiger_hold_timer_seconds column on midnight_sessions and a matching
    // custom field in MailerLite before this will persist anywhere.
    tiger_hold_timer_seconds,
    purchase_status,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  } = body || {};

  if (typeof website === 'string' && website.trim().length > 0) {
    return json(200, { success: true }, allowed); // honeypot, silently accept and drop
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

  if (consent !== true) {
    return json(400, { error: 'Consent is required to subscribe' }, allowed);
  }

  const cleanType = typeof colic_type === 'string' && VALID_COLIC_TYPES.includes(colic_type.trim())
    ? colic_type.trim()
    : '';

  const cleanStatus = VALID_CHECKLIST_STATUS.includes(checklist_status)
    ? checklist_status
    : 'started';

  const cleanStr = (val, maxLen = 200) => {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen).replace(/[<>"'`]/g, '');
  };
  const cleanNum = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? String(n) : '';
  };

  const utm = {
    utm_source: cleanStr(utm_source, 100),
    utm_medium: cleanStr(utm_medium, 100),
    utm_campaign: cleanStr(utm_campaign, 100),
    utm_term: cleanStr(utm_term, 100),
    utm_content: cleanStr(utm_content, 100),
  };

  const API_KEY = env.MAILERLITE_API_KEY;
  // Deliberately a separate env var from the quiz's group. See the
  // reply this file shipped with: whether Midnight-only leads (no
  // quiz completion) should land in the same nurture group as quiz
  // completers is a call on which email Track fires for them, not a
  // technical default I should make silently. Falls back to the
  // quiz's group only so this doesn't hard-fail if the dedicated
  // group hasn't been created yet, confirm this is actually what you
  // want before relying on it.
  const GROUP_ID = env.MAILERLITE_GROUP_ID_MIDNIGHT || env.MAILERLITE_GROUP_ID;

  if (!API_KEY || !GROUP_ID) {
    console.error('[midnight-subscribe] Missing MAILERLITE_API_KEY or a group id');
    return json(500, { error: 'Server configuration error' }, allowed);
  }

  // Build the MailerLite fields payload. colic_type is added
  // conditionally, everything else is always present since these
  // fields are exclusive to this tool and can't clobber quiz data.
  const fields = {
    name: name.trim(),
    baby_age_weeks: cleanNum(baby_age_weeks),
    assessment_id: cleanStr(assessment_id),
    lead_source: cleanStr(lead_source),
    checklist_status: cleanStatus,
    checklist_last_stage: cleanStr(checklist_last_stage),
    checklist_version: cleanStr(checklist_version, 20),
    environment_outcome: cleanStr(environment_outcome, 50),
    tiger_hold_outcome: cleanStr(tiger_hold_outcome, 50),
    final_outcome: cleanStr(final_outcome, 50),
    purchase_status: cleanStr(purchase_status, 50) || 'pending',
    ...utm,
  };
  if (cleanType) {
    fields.colic_type = cleanType;
    fields.colic_type_detail = cleanStr(colic_type_detail);
  }
  // else: key omitted entirely, existing MailerLite value (if any)
  // from a prior quiz completion is left exactly as-is.

  // Dwell/timer fields: each request only ever carries at most one or two
  // of these (whichever stage's submitOutcome() just fired), the rest are
  // absent from the body, not zero. Same clobber rule as colic_type above:
  // only add a key when this specific request actually included a real
  // number for it, otherwise a "started" or "in_progress" ping with no
  // dwell data would blank out a value written by an earlier request for
  // the same session.
  var dwellCandidates = {
    environment_dwell_seconds: environment_dwell_seconds,
    tiger_hold_dwell_seconds: tiger_hold_dwell_seconds,
    gas_release_dwell_seconds: gas_release_dwell_seconds,
    final_dwell_seconds: final_dwell_seconds,
    tiger_hold_timer_seconds: tiger_hold_timer_seconds,
  };
  Object.keys(dwellCandidates).forEach(function (key) {
    var n = cleanNum(dwellCandidates[key]);
    if (n !== '') fields[key] = n;
  });

  // Quiz-handoff confidence (0-100), only present when it actually
  // travelled from the quiz. Same "only add the key when real" rule,
  // requires a colic_type_confidence custom field in MailerLite before
  // this persists there.
  var confidenceNum = cleanNum(colic_type_confidence);
  if (confidenceNum !== '') fields.colic_type_confidence = confidenceNum;

  try {
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
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

    // ── Supabase: two writes, both best-effort, both inactive no-ops
    // until SUPABASE_URL / SUPABASE_SERVICE_KEY are set, same pattern
    // as subscribe.js.
    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
    const cleanAssessmentId = cleanStr(assessment_id);

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && cleanAssessmentId) {
      const supabaseCalls = Promise.all([
        // 1. Session-level row, one per MP- assessment_id, same
        // started -> in_progress -> completed merge pattern the
        // quiz's assessments table already uses.
        fetch(`${SUPABASE_URL}/rest/v1/midnight_sessions?on_conflict=assessment_id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            assessment_id: cleanAssessmentId,
            email: email.trim().toLowerCase(),
            name: name.trim(),
            colic_type: cleanType || null,
            colic_type_from_quiz: colic_type_detail === 'Confirmed from quiz handoff',
            ...(cleanNum(colic_type_confidence) !== '' ? { colic_type_confidence: Number(cleanNum(colic_type_confidence)) } : {}),
            baby_age_weeks: cleanNum(baby_age_weeks) || null,
            checklist_status: cleanStatus,
            checklist_last_stage: cleanStr(checklist_last_stage) || null,
            environment_outcome: cleanStr(environment_outcome, 50) || null,
            tiger_hold_outcome: cleanStr(tiger_hold_outcome, 50) || null,
            final_outcome: cleanStr(final_outcome, 50) || null,
            // Same fields fixed above for MailerLite. Supabase's merge-
            // duplicates upsert only sends a column here when this request
            // actually has it, so a later ping without dwell data can't
            // blank out an earlier stage's recorded time either.
            ...(cleanNum(environment_dwell_seconds) !== '' ? { environment_dwell_seconds: Number(cleanNum(environment_dwell_seconds)) } : {}),
            ...(cleanNum(tiger_hold_dwell_seconds) !== '' ? { tiger_hold_dwell_seconds: Number(cleanNum(tiger_hold_dwell_seconds)) } : {}),
            ...(cleanNum(gas_release_dwell_seconds) !== '' ? { gas_release_dwell_seconds: Number(cleanNum(gas_release_dwell_seconds)) } : {}),
            ...(cleanNum(final_dwell_seconds) !== '' ? { final_dwell_seconds: Number(cleanNum(final_dwell_seconds)) } : {}),
            ...(cleanNum(tiger_hold_timer_seconds) !== '' ? { tiger_hold_timer_seconds: Number(cleanNum(tiger_hold_timer_seconds)) } : {}),
            checklist_version: cleanStr(checklist_version, 20) || null,
            lead_source: cleanStr(lead_source),
            updated_at: new Date().toISOString(),
            ...utm,
          }),
        }),
        // 2. Identity row, via the RPC function, NOT a raw table
        // upsert, so first-touch fields and the colic_type clobber
        // fix both apply the same way for both quiz and midnight.
        fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            p_email: email.trim().toLowerCase(),
            p_name: name.trim(),
            p_baby_age_weeks: cleanNum(baby_age_weeks) ? Number(cleanNum(baby_age_weeks)) : null,
            p_colic_type: cleanType,
            p_source: 'midnight_protocol',
            p_lead_source: cleanStr(lead_source),
            p_utm_medium: utm.utm_medium,
            p_utm_campaign: utm.utm_campaign,
            p_quiz_completed: false,
            p_midnight_completed: cleanStatus === 'completed',
          }),
        }),
      ]).catch((err) => {
        console.warn('[midnight-subscribe] Supabase write failed silently:', err);
      });

      if (typeof context.waitUntil === 'function') {
        context.waitUntil(supabaseCalls);
      } else {
        await supabaseCalls;
      }
    }

    return json(200, { success: true, status: cleanStatus, colic_type: cleanType }, allowed);
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
