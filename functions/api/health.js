/**
 * /functions/api/health.js
 * Funnel Outage Monitor: Lightweight health check and silence monitor.
 *
 * GET /api/health
 *
 * Checks:
 * 1. PostgREST database connectivity to Supabase.
 * 2. Recency of the latest completed assessment.
 * 3. 12-hour and 24-hour completed assessment volume.
 *
 * Alert condition:
 * If hours_since_last_assessment > threshold (default 12 hours), status is 'alert'.
 *
 * External monitoring integration:
 * Passing ?strict=true returns HTTP 503 when in alert state, allowing standard
 * uptime monitors (UptimeRobot, BetterStack) to trigger automatic SMS/Email alerts.
 */

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
  const { env, request } = context;
  const allowed = env.ALLOWED_ORIGIN || '*';
  const url = new URL(request.url);
  const strictMode = url.searchParams.get('strict') === 'true' || url.searchParams.get('uptime') === 'true';
  const customThreshold = parseFloat(url.searchParams.get('threshold'));
  const thresholdHours = Number.isFinite(customThreshold) && customThreshold > 0 ? Math.min(customThreshold, 48) : 12;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    ...corsHeaders(allowed),
  };

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response(
      JSON.stringify({
        status: 'degraded',
        alert: false,
        reason: 'Supabase credentials not set in Cloudflare environment',
        checked_at: new Date().toISOString(),
      }),
      { status: 200, headers }
    );
  }

  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Fetch latest completed assessment timestamp
    const latestPromise = fetch(
      `${SUPABASE_URL}/rest/v1/assessments?select=assessment_id,created_at,quiz_status&quiz_status=eq.completed&email=not.ilike.*test*&email=not.ilike.*example.com*&order=created_at.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    // 2. Fetch count in last 12 hours
    const count12Promise = fetch(
      `${SUPABASE_URL}/rest/v1/assessments?select=assessment_id&quiz_status=eq.completed&email=not.ilike.*test*&email=not.ilike.*example.com*&created_at=gte.${twelveHoursAgo}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: 'count=exact',
          Range: '0-0',
        },
      }
    );

    // 3. Fetch count in last 24 hours
    const count24Promise = fetch(
      `${SUPABASE_URL}/rest/v1/assessments?select=assessment_id&quiz_status=eq.completed&email=not.ilike.*test*&email=not.ilike.*example.com*&created_at=gte.${twentyFourHoursAgo}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: 'count=exact',
          Range: '0-0',
        },
      }
    );

    const [latestRes, count12Res, count24Res] = await Promise.all([
      latestPromise,
      count12Promise,
      count24Promise,
    ]);

    if (!latestRes.ok) {
      console.warn('[health] Supabase query failed with status:', latestRes.status);
      return new Response(
        JSON.stringify({
          status: 'error',
          alert: true,
          error: `Supabase returned HTTP ${latestRes.status}`,
          checked_at: now.toISOString(),
        }),
        { status: strictMode ? 503 : 200, headers }
      );
    }

    const latestRows = await latestRes.json();
    const parseCount = (res) => {
      const range = res.headers.get('content-range');
      if (range && range.includes('/')) {
        const total = parseInt(range.split('/')[1], 10);
        return Number.isFinite(total) ? total : 0;
      }
      return 0;
    };

    const count12h = parseCount(count12Res);
    const count24h = parseCount(count24Res);

    const latest = latestRows && latestRows.length > 0 ? latestRows[0] : null;
    let hoursSinceLast = null;
    let lastAssessmentAt = null;

    if (latest && latest.created_at) {
      lastAssessmentAt = latest.created_at;
      const lastDate = new Date(latest.created_at);
      if (!isNaN(lastDate.getTime())) {
        hoursSinceLast = parseFloat(((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60)).toFixed(1));
      }
    }

    const isSilent = hoursSinceLast !== null ? hoursSinceLast > thresholdHours : count12h === 0;
    const status = isSilent ? 'alert' : 'healthy';

    const payload = {
      status,
      alert: isSilent,
      threshold_hours: thresholdHours,
      hours_since_last_assessment: hoursSinceLast,
      last_assessment_at: lastAssessmentAt,
      completed_last_12h: count12h,
      completed_last_24h: count24h,
      checked_at: now.toISOString(),
      guidance: isSilent
        ? `Warning: No completed assessments in ${hoursSinceLast ?? '>12'} hours. Verify quiz.html and API proxy function.`
        : 'Funnel intake functioning normally.',
    };

    const httpStatus = isSilent && strictMode ? 503 : 200;
    return new Response(JSON.stringify(payload, null, 2), { status: httpStatus, headers });
  } catch (err) {
    console.error('[health] Unexpected monitor error:', err);
    return new Response(
      JSON.stringify({
        status: 'error',
        alert: true,
        error: 'Unexpected monitor exception',
        checked_at: now.toISOString(),
      }),
      { status: strictMode ? 503 : 200, headers }
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
