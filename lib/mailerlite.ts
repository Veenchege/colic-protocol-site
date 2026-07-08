/**
 * lib/mailerlite.ts
 *
 * SERVER-SIDE ONLY.
 * Never import this file in a client component or a file with 'use client'.
 * The API key is read from process.env — only available on the server.
 *
 * All MailerLite API calls in this project go through this wrapper.
 * No raw fetch() to MailerLite anywhere else in the codebase.
 */

const ML_BASE = 'https://connect.mailerlite.com/api'

/* ─── Internal: build auth headers ──────────────────────────── */
function getHeaders(): HeadersInit {
  const key = process.env.MAILERLITE_API_KEY

  if (!key) {
    throw new Error(
      'MAILERLITE_API_KEY is not set. Add it to .env.local and to Vercel environment variables.'
    )
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  }
}

/* ─── Types ──────────────────────────────────────────────────── */
export interface SubscriberPayload {
  email:   string
  name?:   string
  groups?: string[]
  fields?: Record<string, string>
  status?: 'active' | 'unsubscribed'
}

export interface MailerLiteSubscriber {
  id:     string
  email:  string
  status: string
  fields: Record<string, string | null>
}

export interface MailerLiteResponse {
  data: MailerLiteSubscriber
}

/* ─── Upsert subscriber ──────────────────────────────────────── */
/**
 * Creates a new subscriber, or updates an existing one if the email
 * already exists. Safe to call repeatedly — MailerLite handles the upsert.
 *
 * Returns the subscriber object on success.
 * Throws on network error or non-2xx response from MailerLite.
 */
export async function upsertSubscriber(
  payload: SubscriberPayload
): Promise<MailerLiteResponse> {
  const body = {
    email: payload.email.toLowerCase().trim(),
    fields: {
      // 'name' maps to MailerLite's built-in first name field
      name: payload.name?.trim() ?? '',
      // Spread any custom fields (colic_type, lead_source, etc.)
      ...payload.fields,
    },
    groups: payload.groups ?? [],
    status: payload.status ?? 'active',
  }

  const res = await fetch(`${ML_BASE}/subscribers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
    // Vercel edge caching — never cache subscriber writes
    cache: 'no-store',
  })

  // MailerLite returns 200 (update) or 201 (create) on success
  if (res.ok) {
    return res.json() as Promise<MailerLiteResponse>
  }

  // Parse MailerLite error body for logging
  let errorDetail = ''
  try {
    const errJson = await res.json()
    errorDetail = JSON.stringify(errJson)
  } catch {
    errorDetail = await res.text()
  }

  throw new Error(
    `MailerLite API error — status ${res.status}: ${errorDetail}`
  )
}

/* ─── Add subscriber to a group ─────────────────────────────── */
/**
 * Use this if you need to add an *existing* subscriber to a new group
 * without touching their other data. For new subscribers, pass the
 * group ID in upsertSubscriber() instead.
 */
export async function addSubscriberToGroup(
  subscriberId: string,
  groupId: string
): Promise<void> {
  const res = await fetch(
    `${ML_BASE}/subscribers/${subscriberId}/groups/${groupId}`,
    {
      method: 'POST',
      headers: getHeaders(),
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    let errorDetail = ''
    try {
      errorDetail = JSON.stringify(await res.json())
    } catch {
      errorDetail = await res.text()
    }
    throw new Error(
      `MailerLite addGroup error — status ${res.status}: ${errorDetail}`
    )
  }
}
