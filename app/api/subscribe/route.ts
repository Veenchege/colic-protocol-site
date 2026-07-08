/**
 * app/api/subscribe/route.ts
 *
 * General email capture endpoint.
 * Used by:
 *   - Footer newsletter opt-in
 *   - Inline blog post CTAs (InlineCTA component)
 *   - /checklist page direct download opt-in
 *
 * Simpler than quiz-submit — no segmentation, just email + source tag.
 * Adds subscriber to the Midnight Checklist Leads group only.
 *
 * The quiz path (/api/quiz-submit) handles segmented captures.
 * This route handles all non-quiz captures.
 */

import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/mailerlite'

/* ─── Validation ─────────────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Allowlist of valid source values for the lead_source field.
// Add new sources here as new capture points are built.
const VALID_SOURCES = [
  'website_footer',
  'website_inline',
  'website_checklist',
  'website_blog',
  'website_about',
] as const

type SubscribeSource = typeof VALID_SOURCES[number]

/*
 * Rate limiting is intentionally NOT implemented here. See the matching
 * comment in app/api/quiz-submit/route.ts for why an in-memory Map
 * doesn't work on a distributed edge runtime. Configure limits at the
 * platform level (Cloudflare WAF rate limiting rules) instead.
 */

/* ─── Route handler ──────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  // ── Parse body ───────────────────────────────────────────────
  let body: { email?: unknown; name?: unknown; source?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const { email, name, source } = body

  // ── Validate email ───────────────────────────────────────────
  if (
    !email ||
    typeof email !== 'string' ||
    !EMAIL_REGEX.test(email.trim())
  ) {
    return NextResponse.json(
      { error: 'A valid email address is required.' },
      { status: 400 }
    )
  }

  // ── Sanitise name ─────────────────────────────────────────────
  const cleanName =
    typeof name === 'string'
      ? name.trim().slice(0, 100)
      : undefined

  // ── Resolve source tag ────────────────────────────────────────
  const cleanSource: SubscribeSource =
    typeof source === 'string' &&
    VALID_SOURCES.includes(source as SubscribeSource)
      ? (source as SubscribeSource)
      : 'website_inline'

  // ── Build group list ──────────────────────────────────────────
  const groups: string[] = []
  if (process.env.MAILERLITE_GROUP_CHECKLIST)
    groups.push(process.env.MAILERLITE_GROUP_CHECKLIST)

  // ── Subscribe ─────────────────────────────────────────────────
  try {
    await upsertSubscriber({
      email:  email.trim(),
      name:   cleanName,
      groups,
      fields: {
        lead_source: cleanSource,
      },
    })
  } catch (err) {
    console.error('[subscribe] MailerLite error:', err)
    return NextResponse.json(
      {
        error:
          'We could not save your email. Please try downloading the ' +
          'checklist directly at colicprotocol.gumroad.com/l/midnight-emergency-checklist',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

/* ─── Reject other methods ───────────────────────────────────── */
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
