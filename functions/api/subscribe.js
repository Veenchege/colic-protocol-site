/**
 * /functions/api/subscribe.js
 * Cloudflare Pages Function → MailerLite Subscriber Proxy (+ optional Supabase mirror)
 *
 * NO-WIPE RULE: MailerLite and Supabase (merge-duplicates) both overwrite any
 * field that is present in the request, even with '' or null. Each ping only
 * knows part of the story (a path-click ping has no confidence score, a
 * "started" ping has no result), so empty values are dropped with only()
 * and the previously stored value survives. name, email, quiz_status,
 * colic_type_for_email and assessment_id are always sent on purpose.
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

// Must match the exact strings quiz.js sends (RESULTS[type].type).
const VALID_COLIC_TYPES = [
  '',
  'Unassigned',
  'Gut Microbiome Imbalance',
  'Nervous System Dysregulation',
  'Feeding Mechanics',
];

const VALID_FEEDING_METHODS = [
  '',
  'Not specified',
  'Breastfed',
  'Formula-fed',
  'Mixed',
];

// 'blueprint' = went straight to Gumroad checkout.
// 'blueprint_view' = opened the /blueprint product page.
const VALID_PATH_CLICKS = [
  '',
  'checklist',
  'blueprint',
  'blueprint_view',
  'dm',
];

// Drop empty values so a later ping can never blank an earlier one.
const only = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );

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
    baby_name,
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
    red_flag,
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

  const cleanType = typeof colic_type === 'string' ? colic_type.trim() : '';
  if (!VALID_COLIC_TYPES.includes(cleanType)) {
    return json(400, { error: 'Invalid colic type' }, allowed);
  }

  const cleanFeeding =
    typeof feeding_method === 'string' && VALID_FEEDING_METHODS.includes(feeding_method.trim())
      ? feeding_method.trim()
      : 'Not specified';

  const cleanPathClicked =
    typeof path_clicked === 'string' && VALID_PATH_CLICKS.includes(path_clicked.trim())
      ? path_clicked.trim()
      : '';

  // 'red_flag' = the parent reported a warning sign on the safety check
  // and was told to call a doctor. No result is ever shown for these.
  const validStatuses = ['started', 'completed', 'red_flag'];
  const cleanStatus = validStatuses.includes(quiz_status) ? quiz_status : 'started';

  if (cleanStatus === 'completed' && (cleanType === '' || cleanType === 'Unassigned')) {
    return json(400, { error: 'colic_type is required when quiz_status is completed' }, allowed);
  }

  if (consent !== true) {
    return json(400, { error: 'Consent is required to subscribe' }, allowed);
  }

  const cleanStr = (val, maxLen = 200) => {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen).replace(/[<>"'`]/g, '');
  };

  // null, undefined and '' mean "not sent" and return ''. A real 0 passes.
  // (Number(null) is 0, which used to write a fake "0" score.)
  const cleanNum = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' && val.trim() === '') return '';
    const n = Number(val);
    return Number.isFinite(n) ? String(n) : '';
  };

  // 'pending' | 'none' | 'flagged: fever, ...'
  const cleanRedFlag = cleanStr(red_flag, 120);

  const utm = {
    utm_source: cleanStr(utm_source, 100),
    utm_medium: cleanStr(utm_medium, 100),
    utm_campaign: cleanStr(utm_campaign, 100),
    utm_term: cleanStr(utm_term, 100),
    utm_content: cleanStr(utm_content, 100),
  };

  const cleanAssessmentId = cleanStr(assessment_id);

  console.log(
    `[subscribe] ${new Date().toISOString()} email=${email.trim().toLowerCase()} status=${cleanStatus} type=${cleanType || 'none'} feeding=${cleanFeeding} red_flag=${cleanRedFlag || 'n/a'} path=${cleanPathClicked || 'n/a'}`
  );

  const API_KEY = env.MAILERLITE_API_KEY;
  const GROUP_ID = env.MAILERLITE_GROUP_ID;

  if (!API_KEY || !GROUP_ID) {
    console.error('[subscribe] Missing MAILERLITE_API_KEY or MAILERLITE_GROUP_ID');
    return json(500, { error: 'Server configuration error' }, allowed);
  }

  try {
    const fields = {
      name: name.trim(),
      quiz_status: cleanStatus,
      // The quiz automation splits on colic_type_for_email, not colic_type.
      colic_type_for_email: cleanType || 'Unassigned',
      ...only({
        colic_type: cleanType,
        colic_type_detail: cleanStr(colic_type_detail),
        feeding_method: cleanFeeding,
        confidence_pct: cleanNum(confidence_pct),
        baby_age_weeks: cleanNum(baby_age_weeks),
        tried_items: cleanStr(tried_items, 300),
        baby_name: cleanStr(baby_name, 40),
        assessment_id: cleanAssessmentId,
        lead_source: cleanStr(lead_source),
        quiz_version: cleanStr(quiz_version, 20),
        purchase_status: cleanStr(purchase_status, 50),
        path_clicked: cleanPathClicked,
        red_flag: cleanRedFlag,
        ...utm,
      }),
    };

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

    const data = await mlRes.json().catch(() => ({}));
    // 422 stays non-fatal for the quiz, but it is no longer invisible.
    const mlFailed = !mlRes.ok;
    if (mlRes.status === 422) {
      console.error('[subscribe] MailerLite 422:', JSON.stringify(data), 'group:', GROUP_ID);
    }

    else if (mlFailed) {
      console.error('[subscribe] MailerLite error:', mlRes.status);

    }

    // Optional Supabase mirror. One evolving row per assessment_id.
    // Needs: alter table assessments add column if not exists red_flag text;
    const SUPABASE_URL = env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && cleanAssessmentId) {
      const row = {
        assessment_id: cleanAssessmentId,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        quiz_status: cleanStatus,
        updated_at: new Date().toISOString(),
        ...only({
          colic_type: cleanType,
          feeding_method: cleanFeeding,
          baby_age_weeks: cleanNum(baby_age_weeks),
          confidence_pct: cleanNum(confidence_pct),
          path_clicked: cleanPathClicked,
          tried_items: cleanStr(tried_items, 300),
          lead_source: cleanStr(lead_source),
          red_flag: cleanRedFlag,
          ...utm,
        }),
      };

      // A non-2xx here used to vanish silently (a missing column rejected
      // every write for days). Log the status and body so it shows up.
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
          body: JSON.stringify(row),
        }
      )
        .then(async (r) => {
          if (!r.ok) console.error('[subscribe] Supabase assessments write rejected:', r.status, await r.text());
        })
        .catch((err) => {
          console.warn('[subscribe] Supabase write failed silently:', err);
        });

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
      })
        .then(async (r) => {
          if (!r.ok) console.error('[subscribe] upsert_lead rejected:', r.status, await r.text());
        })
        .catch((err) => {
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

    return json(200, { success: true, mailerlite_synced: !mlFailed, ml_status: mlRes.status, status: cleanStatus, colic_type: cleanType }, allowed);
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err);
    return json(500, { error: 'Internal server error' }, allowed);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);
  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return json(405, { error: 'Method not allowed' }, allowed);
}
