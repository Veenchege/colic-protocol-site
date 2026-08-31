/**
 * /functions/api/stats.js
 * Public, read-only aggregate stats for the site (currently: how many
 * assessments have been completed). Returns a COUNT only, never rows,
 * so it's safe to expose without opening the assessments table's RLS
 * to anonymous reads, that table deliberately has zero read policies
 * (see supabase_schema.sql), and this endpoint doesn't change that. It
 * uses the service-role key server-side only, exactly like
 * subscribe.js, the key never reaches the browser.
 *
 * GET /api/stats -> { completed: number, source: 'live' | 'floor' }
 *
 * WHY THE FLOOR EXISTS, READ BEFORE CHANGING IT:
 * The Supabase mirror in subscribe.js only starts writing once
 * SUPABASE_URL and SUPABASE_SERVICE_KEY are set as Cloudflare secrets.
 * It does NOT retroactively contain the assessments already on record
 * in MailerLite from before that switch was flipped, unless someone
 * backfills that history into this table separately. Returning the raw
 * Supabase count on day one of turning this on would show something
 * like "3 parents have completed this assessment" on a site that
 * already has 250+ real completions sitting in MailerLite, a real
 * regression, not just an ugly number, and a false claim in the other
 * direction. FLOOR_COMPLETED is a real, documented figure as of this
 * build, sourced from MailerLite's quiz-completion group, not the
 * blended active-subscriber count, which also includes checklist-only
 * leads. Re-verify that source before raising this number, per the
 * project's own statistics standard: confirmed data only, no
 * unsourced or blended figures presented as one clean number.
 *
 * The displayed count is always max(live, floor), so it can only grow,
 * never regress below the last confirmed real number.
 */
const FLOOR_COMPLETED = 250;

function corsHeaders(allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  };
}

export async function onRequestOptions(context) {
  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return new Response(null, { status: 204, headers: corsHeaders(allowed) });
}

export async function onRequestGet(context) {
  const { env } = context;
  const allowed = env.ALLOWED_ORIGIN || '*';
  const headers = {
    'Content-Type': 'application/json',
    // 5-minute edge cache: this number does not need to be real-time,
    // and caching it avoids a Supabase round trip on every page load.
    'Cache-Control': 'public, max-age=300',
    ...corsHeaders(allowed),
  };

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

  // Supabase mirror not enabled yet, this is the expected state until
  // both secrets are set. Not an error.
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(
      JSON.stringify({ completed: FLOOR_COMPLETED, source: 'floor' }),
      { status: 200, headers }
    );
  }

  try {
    // Prefer: count=exact + Range: 0-0 returns the total in the
    // Content-Range response header without transferring any actual
    // rows, the cheapest possible count query against PostgREST.
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/assessments?select=assessment_id&quiz_status=eq.completed`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: 'count=exact',
          Range: '0-0',
        },
      }
    );

    const range = res.headers.get('content-range'); // e.g. "0-0/312"
    const total = range && range.includes('/')
      ? parseInt(range.split('/')[1], 10)
      : NaN;

    if (!res.ok || !Number.isFinite(total)) {
      console.warn('[stats] Supabase count query failed or unparseable, falling back to floor');
      return new Response(
        JSON.stringify({ completed: FLOOR_COMPLETED, source: 'floor' }),
        { status: 200, headers }
      );
    }

    const completed = Math.max(total, FLOOR_COMPLETED);
    return new Response(
      JSON.stringify({ completed, source: total >= FLOOR_COMPLETED ? 'live' : 'floor' }),
      { status: 200, headers }
    );
  } catch (err) {
    console.warn('[stats] Unexpected error, falling back to floor:', err);
    return new Response(
      JSON.stringify({ completed: FLOOR_COMPLETED, source: 'floor' }),
      { status: 200, headers }
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'OPTIONS') return onRequestOptions(context);

  const allowed = context.env.ALLOWED_ORIGIN || '*';
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(allowed) },
  });
}
