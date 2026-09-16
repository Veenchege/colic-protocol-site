// Cloudflare Pages Function.
// Deploy path in your repo: functions/api/webhooks/gumroad.js
// This works alongside your flat HTML site with no framework needed —
// Pages Functions run independently of whatever static files sit next to them.
//
// Required env vars (set as Cloudflare Pages secrets):
//   GUMROAD_WEBHOOK_TOKEN         - a long random string you generate yourself
//   SUPABASE_URL                  - e.g. https://uvpowjubdjwhjxbqfglz.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY     - service role key (server-side only)
//   MAILERLITE_API_KEY            - MailerLite Connect API key (server-side only)
//   MAILERLITE_CUSTOMERS_GROUP_ID - the MailerLite group ID for "Blueprint customers"
//                                   you create once, manually, in the MailerLite UI
//
// Gumroad Ping is unsigned, so the token in the URL query string is the only
// access control. Register the endpoint in Gumroad Settings > Advanced > Ping as:
//   https://colicprotocol.baby/api/webhooks/gumroad?token=YOUR_LONG_RANDOM_TOKEN
//
// NOTE on `ref`: quiz.js and midnight-protocol.html's Gumroad links already carry
// a `ref=` param predating this webhook. This function captures it into both
// `referrer_ref` and the full raw url_params blob without assuming what it means.
// Once you confirm what `ref` actually holds, decide whether it should replace
// `le` as the primary lead-matching key in the SQL trigger (purchases-table.sql).

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!env.GUMROAD_WEBHOOK_TOKEN || token !== env.GUMROAD_WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  let form;
  try {
    form = await request.formData();
  } catch (err) {
    return new Response('Bad request body', { status: 400 });
  }

  // Gumroad sends url_params as url_params[key]=value form fields.
  // Pull those into their own object, everything else is a normal top-level field.
  const payload = {};
  const urlParams = {};
  for (const [key, value] of form.entries()) {
    const match = key.match(/^url_params\[(.+)\]$/);
    if (match) {
      urlParams[match[1]] = value;
    } else {
      payload[key] = value;
    }
  }

  const saleId = payload.sale_id;
  if (!saleId) {
    // Gumroad's "Send test ping to URL" button sometimes sends a stripped-down
    // payload. Log what arrived so you can see it in the Pages Function logs.
    console.log('Gumroad ping with no sale_id, raw payload:', JSON.stringify(payload));
    return new Response('Missing sale_id', { status: 400 });
  }

  const isRefundOrDispute = payload.refunded === 'true' || payload.disputed === 'true';

  const record = {
    gumroad_sale_id: saleId,
    product_permalink: payload.product_permalink || null,
    product_name: payload.product_name || null,
    price_cents: payload.price ? parseInt(payload.price, 10) : null,
    currency: payload.currency || 'usd',
    buyer_email: payload.email || null,
    lead_email: urlParams.le || null,
    referrer_ref: urlParams.ref || null,
    refunded: payload.refunded === 'true',
    disputed: payload.disputed === 'true',
    dispute_won:
      payload.dispute_won === 'true' ? true : payload.dispute_won === 'false' ? false : null,
    raw_payload: { ...payload, url_params: urlParams },
  };

  const supaRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/purchases?on_conflict=gumroad_sale_id`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(record),
    }
  );

  if (!supaRes.ok) {
    const errText = await supaRes.text();
    console.error('Supabase write failed', supaRes.status, errText);
    // Non-2xx so Gumroad retries the ping — the Supabase write is the source
    // of truth, so a failure here should not be silently swallowed.
    return new Response('Upstream write failed', { status: 502 });
  }

  // Tag the buyer as a customer in MailerLite so pitch automations can be
  // suppressed for them going forward. Only do this on a genuine new sale,
  // not on a refund/dispute re-ping for a sale already recorded, and only
  // if MailerLite is actually configured — don't fail the whole webhook if
  // this part breaks, since the Supabase write (the source of truth) already
  // succeeded above.
  const mailerliteEmail = record.buyer_email || record.lead_email;
  if (!isRefundOrDispute && mailerliteEmail && env.MAILERLITE_API_KEY && env.MAILERLITE_CUSTOMERS_GROUP_ID) {
    try {
      const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email: mailerliteEmail,
          fields: {
            purchased_blueprint: true,
            blueprint_purchase_date: payload.sale_timestamp || new Date().toISOString(),
          },
          groups: [env.MAILERLITE_CUSTOMERS_GROUP_ID],
        }),
      });
      if (!mlRes.ok) {
        const mlErr = await mlRes.text();
        // Logged, not thrown: this is a known follow-up action, not a reason
        // to tell Gumroad the ping failed.
        console.error('MailerLite tag-as-customer failed', mlRes.status, mlErr);
      }
    } catch (err) {
      console.error('MailerLite tag-as-customer request errored', err);
    }
  }

  return new Response('ok', { status: 200 });
}

// So the endpoint doesn't 405 if you or Gumroad ever hit it with GET.
export async function onRequestGet() {
  return new Response('Gumroad webhook endpoint. Expects POST.', { status: 200 });
}

