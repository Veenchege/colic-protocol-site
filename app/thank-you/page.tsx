import type { Metadata } from 'next'
import Link      from 'next/link'
import MinimalNav from '@/components/layout/MinimalNav'
import Button     from '@/components/ui/Button'
import { ColiTypeBadge } from '@/components/ui/Badge'

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:  'Protocol On Its Way — Colic Protocol',
  description: 'Your personalised colic protocol is in your inbox.',
  robots: { index: false, follow: false },  // no need to index this page
}

/* ─── Coli type content ──────────────────────────────────────── */
const TYPE_CONTENT: Record<string, { headline: string; expectation: string }> = {
  GUT: {
    headline:    'Your gut reset protocol is on its way.',
    expectation: 'Your Day 1 email covers the L. reuteri DSM 17938 dosing protocol, feeding method calibration, and the full three-stage sequence. Check your inbox — it arrives within five minutes.',
  },
  NS: {
    headline:    'Your nervous system protocol is on its way.',
    expectation: 'Your Day 1 email covers the Tiger Hold with exact rhythm specifications, the brown noise acoustic layer, and the parent regulation component. Check your inbox — it arrives within five minutes.',
  },
  ACOUSTIC: {
    headline:    'Your acoustic reset protocol is on its way.',
    expectation: 'Your Day 1 email covers the brown noise frequency specifications, environment calibration, and the sequence that must run before any physical technique. Check your inbox — it arrives within five minutes.',
  },
  MIXED: {
    headline:    'Your three-system protocol is on its way.',
    expectation: 'Your Day 1 email covers the full sequenced system — gut reset, nervous system regulation, and acoustic environment in the correct order. Check your inbox — it arrives within five minutes.',
  },
}

const FALLBACK = {
  headline:    'Your protocol is on its way.',
  expectation: 'Your Day 1 email with the full protocol arrives within five minutes. Check your inbox.',
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const coliType = (searchParams.type ?? '').toUpperCase()
  const content  = TYPE_CONTENT[coliType] ?? FALLBACK
  const hasType  = Boolean(TYPE_CONTENT[coliType])

  const gumroadBlueprint =
    process.env.NEXT_PUBLIC_GUMROAD_BLUEPRINT ??
    'https://colicprotocol.gumroad.com/l/TheCalmBabyBlueprint'

  return (
    <>
      <MinimalNav />

      <main id="main-content" className="min-h-screen bg-paper">
        <div className="max-w-2xl mx-auto px-6 md:px-12 py-12 md:py-20">

          {/* ── Success badge ── */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-8 rounded-full bg-success/15 border border-success/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-success" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 10l4 4L16 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-success">
              Submission confirmed
            </p>
          </div>

          {/* ── Coli type badge (if we know it) ── */}
          {hasType && (
            <div className="mb-4">
              <ColiTypeBadge coliType={coliType} />
            </div>
          )}

          {/* ── Headline ── */}
          <h1 className="font-serif font-bold text-brown text-3xl md:text-[44px] leading-snug mb-4">
            {content.headline}
          </h1>

          {/* ── Expectation ── */}
          <p className="text-muted text-sm md:text-base leading-relaxed mb-8">
            {content.expectation}
          </p>

          {/* ── Inbox instructions ── */}
          <div className="bg-card border border-border2 rounded-card p-6 mb-10 flex flex-col gap-3">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2">
              What to do now
            </p>
            {[
              'Open your email app and look for a message from Vincent at Colic Protocol.',
              'If it is not there in five minutes, check your Spam or Promotions folder.',
              'Mark the email as safe so future emails land in your inbox.',
              'Start with Stage 2 of the checklist tonight — brown noise before you pick up your baby.',
            ].map((step, i) => (
              <div key={step} className="flex gap-3">
                <span className="font-serif font-bold text-terra text-lg leading-none flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* ── Bridge to Blueprint ── */}
          <div className="bg-terra/5 border border-terra/20 rounded-card p-7 mb-8">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra mb-2">
              While you wait
            </p>
            <p className="font-serif font-semibold text-brown text-lg leading-snug mb-3">
              The checklist manages tonight. The Blueprint fixes the root cause.
            </p>
            <p className="text-xs text-muted leading-relaxed mb-4">
              The protocol you just received handles the crisis. If you want
              to stop the episodes from starting every evening, the Blueprint
              adds the diagnostic decision tree, the calibrated dosing
              protocol, and the three-system sequencing architecture. $47.
              Full refund if results do not show in 72 hours.
            </p>
            <Button href={gumroadBlueprint} variant="primary" size="sm" external>
              Get the $47 Blueprint
            </Button>
          </div>

          {/* ── Share ── */}
          <div className="pt-6 border-t border-border2">
            <p className="text-xs text-muted leading-relaxed mb-3">
              Know another parent in the colic window? The quiz is free and
              takes 2 minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  'My baby\'s colic type quiz, free, 2 minutes: https://colicprotocol.baby/quiz'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-terra transition-colors duration-150 border border-border2 rounded px-3 py-1.5"
              >
                Share via WhatsApp
              </a>
              <Link
                href="/colic-code-quiz.html"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-terra transition-colors duration-150 border border-border2 rounded px-3 py-1.5"
              >
                Retake the quiz
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
