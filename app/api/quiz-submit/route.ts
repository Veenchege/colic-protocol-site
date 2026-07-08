/**
 * app/api/quiz-submit/route.ts
 *
 * TWO-PHASE ENDPOINT.
 *
 * Phase 1 — 'started': fired from QuizLanding.tsx the moment someone
 * submits name + email, before any question is shown. Captures the lead
 * even if they abandon the quiz. No `answers` field is sent in this phase.
 *
 * Phase 2 — 'completed': fired from QuizContainer.tsx after the 8th
 * question, with the full answers object. Runs segmentation, tags the
 * subscriber with their colic type, and returns the coliType to the
 * client so the results report can render without recomputing anything
 * the server didn't already verify.
 *
 * The MailerLite API key never leaves this file. It lives in
 * MAILERLITE_API_KEY, server-only, never NEXT_PUBLIC_.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  determineColiType,
  buildMailerLiteFields,
  type QuizAnswers,
} from '@/lib/quiz-logic'
import { upsertSubscriber } from '@/lib/mailerlite'

/* ─── Validation ─────────────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const VALID_AGES     = ['0-3w', '3-6w', '6-8w', '8-12w', '12w+']
const VALID_FEEDING  = ['breast', 'formula', 'mixed']
const VALID_CRY_TIMING    = ['evenings', 'feeding', 'random', 'environment']
const VALID_CRY_SOUND     = ['instant', 'escalating', 'waves', 'whiny']
const VALID_BODY_SIGNALS  = ['knees', 'arching', 'startles', 'inconsolable']
const VALID_TRIED_BEFORE  = ['gripewater_gasdrops', 'rocking_bouncing', 'whitenoise', 'feeding_changes', 'nothing']
const VALID_HOLD_RESPONSE = ['facedown_calms', 'rhythmic_calms', 'touch_escalates', 'inconsistent']
const VALID_STOOL         = ['green_frothy', 'normal', 'infrequent', 'unsure']

function validateAnswers(answers: unknown): answers is QuizAnswers {
  if (!answers || typeof answers !== 'object') return false
  const a = answers as Record<string, unknown>

  if (!VALID_AGES.includes(a.babyAge as string))               return false
  if (!VALID_CRY_TIMING.includes(a.cryTiming as string))       return false
  if (!VALID_CRY_SOUND.includes(a.crySound as string))         return false
  if (!VALID_BODY_SIGNALS.includes(a.bodySignals as string))   return false
  if (!VALID_TRIED_BEFORE.includes(a.triedBefore as string))   return false
  if (!VALID_HOLD_RESPONSE.includes(a.holdResponse as string)) return false
  if (!VALID_STOOL.includes(a.stoolType as string))            return false
  if (!VALID_FEEDING.includes(a.feedingMethod as string))      return false

  return true
}

/*
 * Rate limiting is intentionally NOT implemented here.
 *
 * An in-memory Map only works if the same process handles consecutive
 * requests. That assumption is false on any distributed edge runtime
 * (Cloudflare Workers, and unreliable even on Vercel serverless at scale).
 * Each request can land on a different isolate with no shared memory,
 * so an in-app counter silently stops limiting anything.
 *
 * Configure rate limiting at the platform instead:
 *   - Cloudflare: dashboard → Security → WAF → Rate limiting rules.
 *     Free tier supports basic rules, e.g. limit /api/quiz-submit and
 *     /api/subscribe to N requests per IP per minute.
 *   - Vercel: requires a paid plan or an external store (Upstash Redis)
 *     for the same guarantee.
 *
 * If real abuse shows up before platform-level rules are configured,
 * add Upstash Redis (free tier) here rather than reintroducing an
 * in-memory Map.
 */

/* ─── Route handler ──────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; name?: unknown; answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, name, answers } = body

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: 'A valid email address is required.' },
      { status: 400 }
    )
  }

  const cleanName =
    typeof name === 'string' ? name.trim().slice(0, 100) : undefined

  const groups: string[] = []
  if (process.env.MAILERLITE_GROUP_CHECKLIST) groups.push(process.env.MAILERLITE_GROUP_CHECKLIST)
  if (process.env.MAILERLITE_GROUP_QUIZ)      groups.push(process.env.MAILERLITE_GROUP_QUIZ)

  /* ── Phase 1: 'started' — no answers present yet ── */
  if (answers === undefined || answers === null) {
    try {
      await upsertSubscriber({
        email:  email.trim(),
        name:   cleanName,
        groups,
        fields: {
          lead_source: 'website_quiz',
          quiz_status: 'started',
        },
      })
    } catch (err) {
      console.error('[quiz-submit:started] MailerLite error:', err)
      // Non-fatal — the quiz should still proceed even if this write fails.
      // The completion phase will try again with the full answer set.
      return NextResponse.json({ success: true, phase: 'started', warning: 'capture_failed' })
    }
    return NextResponse.json({ success: true, phase: 'started' })
  }

  /* ── Phase 2: 'completed' — full answers present ── */
  if (!validateAnswers(answers)) {
    return NextResponse.json(
      { error: 'Quiz answers are incomplete or contain invalid values.' },
      { status: 400 }
    )
  }

  const coliType  = determineColiType(answers)
  const mlFields  = buildMailerLiteFields(answers, coliType)

  try {
    await upsertSubscriber({
      email:  email.trim(),
      name:   cleanName,
      groups,
      fields: {
        ...mlFields,
        quiz_status: 'completed',
      },
    })
  } catch (err) {
    console.error('[quiz-submit:completed] MailerLite error:', err)
    return NextResponse.json(
      {
        error:
          'We could not save your results. Your report is still shown below, ' +
          'but please also download the checklist directly at ' +
          'colicprotocol.gumroad.com/l/midnight-emergency-checklist',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, phase: 'completed', coliType })
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
