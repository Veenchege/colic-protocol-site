import type { Metadata } from 'next'
import MinimalNav from '@/components/layout/MinimalNav'
import Button     from '@/components/ui/Button'

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:       'The Midnight Emergency Checklist — Free Download',
  description: 'The Zion Protocol. Four stages. Brown noise first, Tiger Hold second, gas release third. Built by an Epidemiologist. Free forever.',
  robots:      { index: true, follow: true },
}

/* ─── Stage data ─────────────────────────────────────────────── */
const STAGES = [
  {
    num:   '01',
    title: 'Stop & Scan',
    desc:  'Rule out the six conditions that require emergency services before applying any soothing protocol.',
  },
  {
    num:   '02',
    title: 'Environment Reset',
    desc:  'Brown noise at 60–65dB, minimum seven feet from head. Warm dim light. This layer runs before touch — always.',
  },
  {
    num:   '03',
    title: 'Soothing Circuit',
    desc:  'Tiger Hold: face-down, forearm pressure, 60 BPM pulse. Five minutes minimum. Not rocking — pulsing.',
  },
  {
    num:   '04',
    title: 'Gas Release Sequence',
    desc:  'Bicycle legs, ILU massage in the correct direction, football hold. Specific sequence, specific reason.',
  },
]

/* ─── Page ───────────────────────────────────────────────────── */
export default function ChecklistPage() {
  const gumroadUrl =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <>
      <MinimalNav />

      <main id="main-content" className="min-h-screen bg-paper">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-12 md:py-20">

          {/* ── Header ── */}
          <div className="mb-10">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              Free · No email required · Instant download
            </p>
            <h1 className="font-serif font-bold text-brown text-3xl md:text-[44px] leading-snug mb-4">
              The Midnight Emergency Checklist{' '}
              <span className="text-terra italic">(The Zion Protocol)</span>
            </h1>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              A four-stage crisis triage built from peer-reviewed colic
              research. Works tonight. Takes 15 minutes to read. Built by an
              Epidemiologist after the medical system said &ldquo;wait it out.&rdquo;
            </p>
          </div>

          {/* ── Stages ── */}
          <div className="flex flex-col gap-3 mb-10">
            {STAGES.map(({ num, title, desc }) => (
              <div
                key={num}
                className="flex gap-4 bg-card border border-border2 rounded-card p-5"
              >
                <span className="font-serif font-bold text-terra text-xl leading-none flex-shrink-0 mt-0.5">
                  {num}
                </span>
                <div>
                  <p className="font-semibold text-brown text-sm mb-0.5">{title}</p>
                  <p className="text-xs text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── What it does NOT include ── */}
          <div className="bg-terra/5 border border-terra/20 rounded-card p-6 mb-10">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra mb-2">
              What the checklist does not include
            </p>
            <p className="text-xs text-muted leading-relaxed">
              The checklist manages a colic episode. It does not include the
              diagnostic decision tree, the calibrated L. reuteri DSM 17938
              dosing protocol, or the sequencing architecture that stops
              episodes from starting the next night. That is the{' '}
              <a
                href="/blueprint"
                className="text-terra underline underline-offset-2 hover:text-terra/80"
              >
                $47 Blueprint
              </a>
              .
            </p>
          </div>

          {/* ── Primary CTA ── */}
          <div className="flex flex-col gap-4">
            <Button href={gumroadUrl} variant="primary" size="lg" external>
              Download the free checklist
            </Button>

            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted2">
              Opens Gumroad · Enter $0 · Instant PDF download
            </p>
          </div>

          {/* ── Or take the quiz ── */}
          <div className="mt-8 pt-8 border-t border-border2">
            <p className="text-sm text-muted leading-relaxed mb-3">
              Want a version personalised to your baby&apos;s specific colic
              type? The free quiz takes 2 minutes and sends the right
              protocol track to your email.
            </p>
            <Button href="/quiz" variant="secondary" size="sm">
              Take the free colic type quiz instead
            </Button>
          </div>

          {/* ── Disclaimer ── */}
          <p className="mt-10 text-[11px] text-muted2 leading-relaxed border-t border-border pt-6">
            This checklist is for informational purposes only and does not
            constitute medical advice. If your baby has a fever above 38°C,
            difficulty breathing, or you are concerned about their welfare,
            contact emergency services immediately.
          </p>
        </div>
      </main>
    </>
  )
}
