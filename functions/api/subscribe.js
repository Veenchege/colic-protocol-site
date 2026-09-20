/**
 * /functions/api/subscribe.js
 * Cloudflare Pages Function → MailerLite Subscriber Proxy
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

// Accept only the exact values sent by quiz.html. Migrated this version:
// Acoustic Environment Overload -> Feeding Mechanics, matching quiz.html's
// RESULTS.FM.type and the naming the email sequence (Colic_Protocol_
// Email_Sequence_v3) already uses for its ?type=FM variant. Existing
// MailerLite subscribers already tagged "Acoustic Environment Overload"
// from before this migration are untouched by this list, historical
// data, not retroactively relabeled, that's a separate decision.
const VALID_COLIC_TYPES = [
  '',
  'Unassigned',
  'Gut Microbiome Imbalance',
  'Nervous System Dysregulation',
  'Feeding Mechanics',
];

// Accept only the exact values sent by quiz.html's Q7 (single-select).
// 'Not specified' covers the early "quiz started" call, fired before
// Q7 has been answered, and any legacy client that doesn't send this
// field at all.
const VALID_FEEDING_METHODS = [
  '',
  'Not specified',
  'Breastfed',
  'Formula-fed',
  'Mixed',
];

// Which of the two result-page paths (or the DM fallback) she actually
// clicked. Same soft-fallback pattern as feeding method: an unrecognized
// value shouldn't fail the whole subscription, it just doesn't get
// tagged. NOTE: MailerLite needs a `path_clicked` custom field created
// in the account before this will actually persist — see the comment
// on the fields payload below for what happens if it isn't there yet.
const VALID_PATH_CLICKS = [
  '',
  'checklist',
  'blueprint',
  'dm',
];

export async function onRequestOptions(context) {
  const allowed = context.env.ALLOWED_ORIGIN || '*';

  return new Response(null, {
    status: 204,
    headers: corsHeaders(allowed),
  });
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
    colic_type,
    colic_type_detail,
    feeding_method,
    quiz_status,
    website,
    consent,
    confidence_pct,
    baby_age_weeks,
    tried_items,
    assessment_id,
    lead_source,
    quiz_version,
    purchase_status,
    path_clicked,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  } = body || {};

  // Honeypot spam trap
  if (typeof website === 'string' && website.trim().length > 0) {
    return json(200, { success: true }, allowed);
  }

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return json(400, { error: 'Name is required' }, allowed);
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    return json(400, { error: 'Email is required' }, allowed);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return json(400, { error: 'Invalid email address' }, allowed);
  }

  // Validate colic type exactly as sent by quiz.html
  const cleanType =
    typeof colic_type === 'string'
      ? colic_type.trim()
      : '';

  if (!VALID_COLIC_TYPES.includes(cleanType)) {
    return json(400, { error: 'Invalid colic type' }, allowed);
  }

  // Feeding method: validate against the known set, but don't hard-fail
  // the whole submission on an unrecognized value, since that would
  // reject legitimate leads from any client build that predates this
  // field. Fall back to 'Not specified' instead.
  const cleanFeeding =
    typeof feeding_method === 'string' && VALID_FEEDING_METHODS.includes(feeding_method.trim())
      ? feeding_method.trim()
      : 'Not specified';

  const cleanPathClicked =
    typeof path_clicked === 'string' && VALID_PATH_CLICKS.includes(path_clicked.trim())
      ? path_clicked.trim()
      : '';

  // Quiz status validation
  const validStatuses = ['started', 'completed'];

  const cleanStatus = validStatuses.includes(quiz_status)
    ? quiz_status
    : 'started';

  if (
    cleanStatus === 'completed' &&
    (cleanType === '' || cleanType === 'Unassigned')
  ) {
    return json(
      400,
      { error: 'colic_type is required when quiz_status is completed' },
      allowed
    );
  }

  // Consent required
  if (consent !== true) {
    return json(
      400,
      { error: 'Consent is required to subscribe' },
      allowed
    );
  }

  const cleanStr = (val, maxLen = 200) => {
    if (typeof val !== 'string') return '';

    return val
      .trim()
      .slice(0, maxLen)
      .replace(/[<>"'`]/g, '');
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

  console.log(
    `[subscribe] ${new Date().toISOString()} email=${email
      .trim()
      .toLowerCase()} status=${cleanStatus} type=${cleanType || 'none'} feeding=${cleanFeeding}`
  );

  const API_KEY = env.MAILERLITE_API_KEY;
  const GROUP_ID = env.MAILERLITE_GROUP_ID;

  if (!API_KEY || !GROUP_ID) {
    console.error(
      '[subscribe] Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_ID'
    );

    return json(
      500,
      { error: 'Server configuration error' },
      allowed
    );
  }

  try {
    const mlRes = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fields: {
            name: name.trim(),
            colic_type: cleanType,
            colic_type_detail: cleanStr(colic_type_detail),
            // AUTOMATION-SPLIT FIX: the "90 second quiz" MailerLite
            // automation's Condition 2/3/4 branches split on
            // colic_type_for_email, not on colic_type directly. This
            // field was never added when quiz.js/subscribe.js were
            // rebuilt, so every completion since has had colic_type
            // written correctly while the automation's own split
            // field stayed permanently blank — every quiz completion
            // dead-ends at the type check and gets no email. cleanType
            // is '' on the initial 'started' call (colic_type is
            // 'Unassigned' at that point per quiz.js), so this falls
            // back to 'Unassigned' there too, same convention as
            // midnight-subscribe.js's identical fix.
            colic_type_for_email: cleanType || 'Unassigned',
            feeding_method: cleanFeeding,
            quiz_status: cleanStatus,
            confidence_pct: cleanNum(confidence_pct),
            baby_age_weeks: cleanNum(baby_age_weeks),
            tried_items: cleanStr(tried_items, 300),
            assessment_id: cleanStr(assessment_id),
            lead_source: cleanStr(lead_source),
            quiz_version: cleanStr(quiz_version, 20),
            purchase_status: cleanStr(purchase_status, 50),
            path_clicked: cleanPathClicked,
            ...utm,
          },
          groups: [GROUP_ID],
          status: 'active',
        }),
      }
    );

    const data = await mlRes.json();

    if (!mlRes.ok && mlRes.status !== 422) {
      console.error(
        '[subscribe] MailerLite error:',
        mlRes.status,
        JSON.stringify(data)
      );

      return json(
        502,
        { error: 'Subscription failed, please try again' },
        allowed
      );
    }

    // Optional Supabase mirror. Inactive until SUPABASE_URL and
    // SUPABASE_SERVICE_KEY are set as Cloudflare secrets — until then
    // this block is a no-op, nothing to configure to keep shipping
    // without it. When enabled, this upserts ONE evolving row per
    // assessment_id (started -> completed -> path_clicked all merge
    // into the same row), not an append-only event log. That's enough
    // for "what happened with this assessment" lookups; if you later
    // want exact click timestamps as separate rows, that's a second,
    // deliberately separate table (assessment_events), not this one.
    // Schema:
    //   create table assessments (
    //     assessment_id text primary key,
    //     email text, name text,
    //     colic_type text, feeding_method text,
    //     baby_age_weeks numeric, confidence_pct numeric,
    //     quiz_status text, path_clicked text,
    //     tried_items text,
    //     lead_source text,
    //     utm_source text, utm_medium text, utm_campaign text,
    //     utm_term text, utm_content text,
    //     updated_at timestamptz
    //   );
    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && cleanStr(assessment_id)) {
      const supabaseWrite = fetch(
        `${SUPABASE_URL}/rest/v1/assessments?on_conflict=assessment_id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            assessment_id: cleanStr(assessment_id),
            email: email.trim().toLowerCase(),
            name: name.trim(),
            colic_type: cleanType,
            feeding_method: cleanFeeding,
            baby_age_weeks: cleanNum(baby_age_weeks) || null,
            confidence_pct: cleanNum(confidence_pct) || null,
            quiz_status: cleanStatus,
            path_clicked: cleanPathClicked || null,
            tried_items: cleanStr(tried_items, 300) || null,
            lead_source: cleanStr(lead_source),
            updated_at: new Date().toISOString(),
            ...utm,
          }),
        }
      ).catch((err) => {
        // Best-effort. A Supabase hiccup should never block the
        // MailerLite subscription the person is actually waiting on.
        console.warn('[subscribe] Supabase write failed silently:', err);
      });

      // Identity merge, added alongside the write above, not
      // replacing it. Without this call, the `leads` table only ever
      // gets populated from the Midnight Protocol side
      // (midnight-subscribe.js), which means a quiz-only completion
      // never creates a canonical identity row and the "same email
      // used in both tools" merge silently doesn't happen for anyone
      // who did the quiz first, which is the common path. Uses the
      // same upsert_lead() function midnight-subscribe.js calls, so
      // the two tools can't independently disagree on merge logic.
      // colic_type is required for a 'completed' quiz submission
      // (validated above), so there is no clobber risk from this call
      // the way there is on the Midnight Protocol side.
      const leadUpsert = fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_lead`, {
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
          p_source: 'quiz',
          p_lead_source: cleanStr(lead_source),
          p_utm_medium: utm.utm_medium,
          p_utm_campaign: utm.utm_campaign,
          p_quiz_completed: cleanStatus === 'completed',
          p_midnight_completed: false,
        }),
      }).catch((err) => {
        console.warn('[subscribe] Lead upsert failed silently:', err);
      });

      if (typeof context.waitUntil === 'function') {
        context.waitUntil(supabaseWrite);
        context.waitUntil(leadUpsert);
      } else {
        await supabaseWrite;
        await leadUpsert;
      }
    }

    return json(200, {
      success: true,
      status: cleanStatus,
      colic_type: cleanType,
    }, allowed);

  } catch (err) {
    console.error('[subscribe] Unexpected error:', err);

    return json(
      500,
      { error: 'Internal server error' },
      allowed
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }

  if (context.request.method === 'OPTIONS') {
    return onRequestOptions(context);
  }

  const allowed = context.env.ALLOWED_ORIGIN || '*';

  return json(
    405,
    { error: 'Method not allowed' },
    allowed
  );
}