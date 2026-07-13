/**
 * app/api/assessment-submit/route.ts
 *
 * Receives submissions from the standalone Colic Root Cause Assessment
 * (public/colic-code-quiz.html), a separate, older quiz from the one
 * powering /quiz. That quiz computes colic type client-side and posts
 * its own payload shape here, distinct from what /api/quiz-submit expects.
 *
 * Kept as its own route rather than merged into /api/subscribe or
 * /api/quiz-submit because the payload shape, and the segmentation
 * logic behind it, genuinely differ between all three quizzes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/mailerlite'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown
    name?: unknown
    colic_type?: unknown
    colic_type_detail?: unknown
    group_id?: unknown
    assessment_id?: unknown
    lead_source?: unknown
    quiz_status?: unknown
    quiz_version?: unknown
    baby_age_weeks?: unknown
    purchase_status?: unknown
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, name } = body

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: 'A valid email address is required.' },
      { status: 400 }
    )
  }

  const cleanName =
    typeof name === 'string' ? name.trim().slice(0, 100) : undefined

  const groups: string[] =
    typeof body.group_id === 'string' && body.group_id.trim()
      ? [body.group_id.trim()]
      : []

  // fields must be Record<string, string> — baby_age_weeks arrives as a
  // number from the client and has to be coerced, everything else is
  // already a string on the sending side.
  const fields: Record<string, string> = {}
  if (typeof body.colic_type === 'string') fields.colic_type = body.colic_type
  if (typeof body.colic_type_detail === 'string') fields.colic_type_detail = body.colic_type_detail
  if (typeof body.assessment_id === 'string') fields.assessment_id = body.assessment_id
  if (typeof body.lead_source === 'string') fields.lead_source = body.lead_source
  if (typeof body.quiz_status === 'string') fields.quiz_status = body.quiz_status
  if (typeof body.quiz_version === 'string') fields.quiz_version = body.quiz_version
  if (typeof body.purchase_status === 'string') fields.purchase_status = body.purchase_status
  if (typeof body.baby_age_weeks === 'number' && Number.isFinite(body.baby_age_weeks)) {
    fields.baby_age_weeks = String(body.baby_age_weeks)
  }

  try {
    await upsertSubscriber({
      email: email.trim(),
      name: cleanName,
      groups,
      fields,
    })
  } catch (err) {
    console.error('[assessment-submit] MailerLite error:', err)
    // Matches the original standalone quiz's behaviour: never block the
    // person from seeing their result over a failed background write.
    return NextResponse.json({ success: true, warning: 'capture_failed' })
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}