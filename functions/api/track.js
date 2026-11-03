/**
 * /functions/api/track.js
 * Anonymous-first sync for the Start hub (tracker, signals, offers).
 * Same pattern as subscribe.js: service key stays server-side, empty values
 * never overwrite stored ones. The device_id is a random UUID kept in the
 * parent's browser and acts as the only credential, so nothing here ever
 * returns stored rows. POST { device_id, action?: 'sync' | 'delete', ... }
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KINDS = ['feed', 'cry', 'sleep', 'diaper'];
const FEEDING = ['Breastfed', 'Formula-fed', 'Mixed'];
const ACTIONS = ['shown', 'clicked', 'dismissed'];
const only = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== null && v !== undefined));
const cors = (o) => ({ 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' });
const json = (s, b, o) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...cors(o) } });
const str = (v, n = 100) => (typeof v === 'string' ? v.trim().slice(0, n).replace(/[<>"'`]/g, '') : '');

export async function onRequestOptions({ env }) {
  return new Response(null, { status: 204, headers: cors(env.ALLOWED_ORIGIN || '*') });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const allowed = env.ALLOWED_ORIGIN || '*';
  let b;
  try { b = await request.json(); } catch { return json(400, { error: 'Invalid JSON' }, allowed); }
  if (!b || !UUID.test(b.device_id || '')) return json(400, { error: 'Invalid device_id' }, allowed);
  if (typeof b.website === 'string' && b.website) return json(200, { ok: true }, allowed);

  const URL_ = env.SUPABASE_URL;
  const KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL_ || !KEY) return json(500, { error: 'Server configuration error' }, allowed);
  const H = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` };
  const rest = (path, opts) => fetch(`${URL_}/rest/v1/${path}`, { headers: H, ...opts });

  // Delete-my-data: cascades to events and offer_log.
  if (b.action === 'delete') {
    const r = await rest(`tool_profiles?device_id=eq.${b.device_id}`, { method: 'DELETE' });
    return json(r.ok ? 200 : 502, { ok: r.ok }, allowed);
  }

  if (b.action === 'remove') {
    const ids = (Array.isArray(b.ids) ? b.ids : []).slice(0, 100).filter((i) => typeof i === 'string' && /^[\w-]{1,64}$/.test(i));
    if (!ids.length) return json(200, { ok: true }, allowed);
    const r = await rest(`baby_events?device_id=eq.${b.device_id}&id=in.(${ids.join(',')})`, { method: 'DELETE' });
    return json(r.ok ? 200 : 502, { ok: r.ok }, allowed);
  }

  if (b.action === 'restore_start' || b.action === 'restore_verify') {
    const em = str(b.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return json(400, { error: 'Invalid email' }, allowed);
    const AUTH = { 'Content-Type': 'application/json', apikey: env.SUPABASE_ANON_KEY || KEY };
    const found = await (await rest(`tool_profiles?select=device_id,name,baby_name,baby_age_weeks,feeding_method,red_flag&email=eq.${encodeURIComponent(em)}&order=created_at.asc`)).json().catch(() => []);
    if (b.action === 'restore_start') {
      // Same answer whether or not a log exists, so emails cannot be probed.
      if (Array.isArray(found) && found.length) await fetch(`${URL_}/auth/v1/otp`, { method: 'POST', headers: AUTH, body: JSON.stringify({ email: em, create_user: true }) }).catch(() => {});
      return json(200, { ok: true }, allowed);
    }
    const v = await fetch(`${URL_}/auth/v1/verify`, { method: 'POST', headers: AUTH, body: JSON.stringify({ type: 'email', email: em, token: str(b.code, 10) }) });
    if (!v.ok || !Array.isArray(found) || !found.length) return json(401, { ok: false }, allowed);
    const ids = found.map((f) => f.device_id).join(',');
    const evs = await (await rest(`baby_events?select=id,kind,occurred_at,detail&device_id=in.(${ids})&order=occurred_at.asc&limit=1000`)).json().catch(() => []);
    return json(200, { ok: true, device_id: found[0].device_id, profile: found[0], events: evs }, allowed);
  }

  const p = b.profile || {};
  const email = typeof p.email === 'string' ? p.email.trim().toLowerCase() : '';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (email && !emailOk) return json(400, { error: 'Invalid email' }, allowed);
  if (email && p.consent !== true) return json(400, { error: 'Consent is required to save an email' }, allowed);

  const age = Number(p.age);
  const profile = {
    device_id: b.device_id,
    updated_at: new Date().toISOString(),
    ...only({
      email, name: str(p.name, 60), baby_name: str(p.baby, 40),
      baby_age_weeks: Number.isFinite(age) && p.age !== '' && age >= 0 && age <= 60 ? Math.round(age) : '',
      feeding_method: FEEDING.includes(p.feeding) ? p.feeding : '',
      red_flag: /^(pending|none|flagged: [\w ,]{1,100})$/.test(p.rf || '') ? p.rf : '',
      consent: p.consent === true ? true : '',
      door: ['quiz', 'tonight', 'track'].includes(p.door) ? p.door : '',
      utm: p.utm && typeof p.utm === 'object' ? Object.fromEntries(Object.entries(p.utm).slice(0, 5).map(([k, v]) => [str(k, 20), str(v)])) : '',
    }),
  };
  const pr = await rest('tool_profiles?on_conflict=device_id', { method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(profile) });
  if (!pr.ok) { console.error('[track] profile', pr.status, await pr.text()); return json(502, { error: 'Sync failed' }, allowed); }

  const events = (Array.isArray(b.events) ? b.events : []).slice(0, 200).map((e) => {
    const t = new Date(e && e.t);
    if (!e || !KINDS.includes(e.k) || isNaN(t) || !str(e.id, 64)) return null;
    const d = JSON.stringify(e.d && typeof e.d === 'object' ? e.d : {});
    return { id: str(e.id, 64), device_id: b.device_id, kind: e.k, occurred_at: t.toISOString(), detail: d.length < 500 ? JSON.parse(d) : {} };
  }).filter(Boolean);
  if (events.length) {
    const er = await rest('baby_events?on_conflict=id', { method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(events) });
    if (!er.ok) { console.error('[track] events', er.status, await er.text()); return json(502, { error: 'Sync failed' }, allowed); }
  }

  const offers = (Array.isArray(b.offers) ? b.offers : []).slice(0, 20).filter((o) => o && ACTIONS.includes(o.a) && /^[\w-]{1,40}$/.test(o.r || ''))
    .map((o) => ({ device_id: b.device_id, rule: o.r, action: o.a }));
  if (offers.length) await rest('offer_log', { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(offers) });

  // Link the anonymous history to a real lead once she gives an email + consent.
  if (emailOk && p.consent === true) {
    const lead = rest('rpc/upsert_lead', { method: 'POST', body: JSON.stringify({
      p_email: email, p_name: str(p.name, 60) || 'Friend',
      p_baby_age_weeks: profile.baby_age_weeks ?? null, p_colic_type: '',
      p_source: 'tracker', p_lead_source: str(p.utm && p.utm.utm_source),
      p_utm_medium: str(p.utm && p.utm.utm_medium), p_utm_campaign: str(p.utm && p.utm.utm_campaign),
      p_quiz_completed: false, p_midnight_completed: false,
    }) }).then(async (r) => { if (!r.ok) console.error('[track] upsert_lead', r.status, await r.text()); }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(lead); else await lead;
  }
  return json(200, { ok: true }, allowed);
}

export async function onRequest(ctx) {
  if (ctx.request.method === 'POST') return onRequestPost(ctx);
  if (ctx.request.method === 'OPTIONS') return onRequestOptions(ctx);
  return json(405, { error: 'Method not allowed' }, ctx.env.ALLOWED_ORIGIN || '*');
}
