import type { Metadata } from 'next'
import MinimalNav    from '@/components/layout/MinimalNav'
import QuizContainer from '@/components/quiz/QuizContainer'

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:  'Find Your Baby\'s Colic Type — Free 90-Second Test',
  description:
    'Answer 8 questions. Get a personalised colic protocol report based on your baby\'s specific root cause, gut, nervous system, or acoustic. Free.',
  robots: {
    // Index the quiz for search — it is a useful resource
    index:  true,
    follow: true,
  },
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function QuizPage() {
  return (
    <>
      {/*
        MinimalNav with logoLinksHome={false}:
        On the quiz page, clicking the logo should not navigate away
        mid-session. The browser back button still works — this only
        prevents accidental loss of quiz state from a logo click.
      */}
      <MinimalNav logoLinksHome={false} />

      <main
        id="main-content"
        className="min-h-screen bg-bg"
      >
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-16">

          {/* Page intro */}
          <div className="mb-10">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-3 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              Free · 2 minutes · No credit card
            </p>
            <h1 className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug">
              Find your baby&apos;s{' '}
              <span className="text-terra">colic type.</span>
            </h1>
            <p className="text-muted text-sm leading-relaxed mt-3 max-w-prose">
              Tell us your email first, then answer 8 questions. Each answer
              narrows the root cause. At the end you get a full report, gut
              reset, nervous system regulation, or acoustic correction,
              calibrated to your baby&apos;s specific presentation.
            </p>
          </div>

          {/* Quiz — full client component */}
          <QuizContainer />

          {/* Medical disclaimer — required on all tool pages */}
          <p className="mt-12 text-[11px] text-muted2 leading-relaxed border-t border-border pt-6">
            This quiz is an informational tool and does not constitute medical
            advice or diagnosis. If your baby has a fever above 38°C,
            difficulty breathing, or you are concerned about their welfare,
            contact emergency services immediately.
          </p>
        </div>
      </main>
    </>
  )
}
