import type { Metadata } from 'next'
import MinimalNav    from '@/components/layout/MinimalNav'
import Footer        from '@/components/layout/Footer'
import GuaranteeBlock from '@/components/sections/GuaranteeBlock'
import Testimonials  from '@/components/sections/Testimonials'
import FAQ           from '@/components/sections/FAQ'
import Button        from '@/components/ui/Button'
import CitationCard, { CITATIONS } from '@/components/ui/CitationCard'

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:       'The Calm Baby Blueprint — $47 Complete Colic Management System',
  description: 'Diagnostic protocol. Gut reset. Physical techniques. Acoustic design. Three bonuses. $47. Full refund if results do not show in 72 hours — you keep everything.',
  robots:      { index: true, follow: true },
}

/* ─── Component data ─────────────────────────────────────────── */
const CORE_COMPONENTS = [
  {
    num:   '01',
    title: 'Diagnostic Protocol',
    desc:  'A decision tree that identifies which of the three root cause systems is primary in your specific baby before any intervention is applied. This is what the checklist does not include. Treating nervous system dysregulation with a gut protocol extends suffering by weeks.',
  },
  {
    num:   '02',
    title: 'Gut Reset Protocol',
    desc:  'L. reuteri DSM 17938 — the specific strain backed by Savino et al. Pediatrics 2010. Exact dosage for breastfed versus formula-fed infants. Timing window relative to feeding schedule. Getting timing wrong reduces efficacy by up to 40%. All specifics included.',
  },
  {
    num:   '03',
    title: 'Physical Techniques',
    desc:  'Tiger Hold with exact rhythm specifications (60 BPM — why this specific number). ILU gas massage in the correct direction with the mechanical reason for the sequence. Vagus nerve stimulation protocol. These are not generic instructions — they have mechanism explanations.',
  },
  {
    num:   '04',
    title: 'Acoustic Design',
    desc:  'Frequency, volume, distance, and duration specifications for brown noise deployment. Why seven feet is the minimum and what happens below it. How to integrate the acoustic layer with the physical hold sequence. Timing protocol for 15-minute assessment cycles.',
  },
]

const BONUSES = [
  {
    title: 'Bloom Baby Tracker App',
    desc:  'A Progressive Web App that installs to your iPhone or Android home screen. One-tap logging at 3AM — crying duration, feeding time, sleep window. Reveals trigger patterns within 3 to 5 days of consistent use. Identifies which protocol element is working.',
    tag:   'Bonus 1',
  },
  {
    title: '60-Minute Brown Noise Soundscape',
    desc:  'A lossless audio file calibrated to womb frequencies — maternal heartbeat rate, blood flow, and digestive sound range. Not generic brown noise from YouTube. Engineered to the specific frequency profile the infant nervous system spent nine months calibrated to. Use tonight.',
    tag:   'Bonus 2',
  },
  {
    title: 'Cry Decoder Masterclass',
    desc:  'An audio training that teaches your ear to distinguish hunger cry from colic pain cry from overtired cry in under five seconds. The most common colic frustration is applying a colic intervention to a hunger cry or vice versa. This eliminates that error.',
    tag:   'Bonus 3',
  },
]

const PRICE_ANCHORS = [
  { label: 'Single colic consultation', cost: '$300–$500' },
  { label: 'Gripe water — 3 rounds',   cost: '$45–$55 wasted' },
  { label: 'Gas drops — 2 rounds',     cost: '$20–$30 wasted' },
  { label: 'White noise machine',      cost: '$35–$80 (wrong frequency)' },
  { label: 'Calm Baby Blueprint',      cost: '$47 · one time' },
]

/* ─── Page ───────────────────────────────────────────────────── */
export default function BlueprintPage() {
  const gumroadUrl =
    process.env.NEXT_PUBLIC_GUMROAD_BLUEPRINT ??
    'https://colicprotocol.gumroad.com/l/TheCalmBabyBlueprint'

  return (
    <>
      <MinimalNav />

      <main id="main-content">

        {/* ── 1. Hero — price and guarantee visible above fold ── */}
        <section className="bg-bg py-14 md:py-20 border-b border-border2">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              Complete colic management system
            </p>
            <h1 className="font-serif font-bold text-brown text-3xl md:text-[48px] leading-snug mb-4">
              The Calm Baby Blueprint
            </h1>
            <p className="text-muted text-base md:text-lg leading-relaxed mb-6 max-w-prose">
              The diagnostic protocol, gut reset, physical technique
              sequences, and acoustic design specifications the checklist
              cannot give you. Three bonuses included. One payment. No
              subscription.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button href={gumroadUrl} variant="primary" size="lg" external>
                Get the Blueprint — $47
              </Button>
              <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted2">
                Full refund if results don&apos;t show in 72 hours
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. Guarantee FIRST — risk removed before pitch ── */}
        <section className="bg-surface py-12">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-serif font-semibold text-brown text-lg mb-5">
              Before anything else — the results commitment.
            </p>
            <GuaranteeBlock showCTA={false} />
          </div>
        </section>

        {/* ── 3. The gap ── */}
        <section className="bg-bg py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              What the checklist cannot do
            </p>
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-6">
              The checklist manages the crisis.{' '}
              <span className="text-terra">It does not fix the root cause.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { x: 'Identifies which system is primary before treatment', check: false },
                { x: 'Calibrated L. reuteri dosing for breastfed vs formula', check: false },
                { x: 'Timing window relative to feeding schedule', check: false },
                { x: 'Sequencing architecture for all three systems', check: false },
                { x: 'Stage 2: Environment Reset (brown noise)', check: true },
                { x: 'Stage 3: Tiger Hold soothing circuit', check: true },
                { x: 'Stage 4: Gas release sequence', check: true },
                { x: 'Stage 1: Medical emergency check', check: true },
              ].map(({ x, check }) => (
                <div
                  key={x}
                  className={`flex gap-3 p-3 rounded-card border text-sm ${
                    check
                      ? 'border-success/25 bg-success/5 text-muted'
                      : 'border-error/25 bg-error/5 text-muted'
                  }`}
                >
                  <span className={`font-bold flex-shrink-0 mt-0.5 ${check ? 'text-success' : 'text-error'}`}>
                    {check ? '✓' : '✗'}
                  </span>
                  <span className="leading-snug">{x}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. What's inside — core components ── */}
        <section className="bg-surface py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              What is inside
            </p>
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-8">
              Every component. No vague promises.
            </h2>

            {/* Core */}
            <div className="flex flex-col gap-4 mb-10">
              {CORE_COMPONENTS.map(({ num, title, desc }) => (
                <div
                  key={num}
                  className="bg-card border border-border2 rounded-card p-6 flex gap-4"
                >
                  <span className="font-serif font-bold text-terra text-2xl leading-none flex-shrink-0 mt-0.5">
                    {num}
                  </span>
                  <div>
                    <p className="font-semibold text-brown text-sm mb-1">{title}</p>
                    <p className="text-xs text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bonuses */}
            <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-terra mb-4">
              Included bonuses
            </p>
            <div className="flex flex-col gap-4">
              {BONUSES.map(({ title, desc, tag }) => (
                <div
                  key={title}
                  className="bg-terra/5 border border-terra/20 rounded-card p-6 flex gap-4"
                >
                  <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-terra flex-shrink-0 mt-0.5 w-14">
                    {tag}
                  </span>
                  <div>
                    <p className="font-semibold text-brown text-sm mb-1">{title}</p>
                    <p className="text-xs text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Science ── */}
        <section className="bg-bg py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              The evidence base
            </p>
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-8">
              Not a mommy-blog ebook.{' '}
              <span className="text-terra">Built from peer-reviewed research.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {CITATIONS.map((c) => (
                <CitationCard key={`${c.authors}-${c.year}`} citation={c} />
              ))}
            </div>
            <p className="font-mono text-[10px] tracking-[0.06em] text-muted2 leading-relaxed">
              Note on Liao et al. 2026: association only — language of proven causation is not supported by this study design.
            </p>
          </div>
        </section>

        {/* ── 6. Origin story (condensed) ── */}
        <section className="bg-surface py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              Why this exists
            </p>
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-6">
              Week 3. My daughter Zion had been crying for six hours.
            </h2>
            <div className="flex flex-col gap-4 text-sm text-muted leading-relaxed mb-6">
              <p>The medical system gave gripe water recommendations and told me to wait. As an Epidemiologist, I went back to the primary literature instead and found what the research had been showing since 2010 — a converging evidence base that no one had packaged for a parent at 3AM.</p>
              <p>I built a sequenced protocol targeting all three root cause systems simultaneously. Within 48 hours, Zion slept for four consecutive hours for the first time in three weeks.</p>
              <p className="italic text-brown font-medium">This information exists in the published literature. It works. The Blueprint is just the packaging that makes it usable at 3AM.</p>
            </div>
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2">
              Vincent · Epidemiologist & Health Data Analyst
            </p>
          </div>
        </section>

        {/* ── 7. Testimonials (conditional) ── */}
        <Testimonials />

        {/* ── 8. Pricing block ── */}
        <section className="bg-bg py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-6 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              What it costs
            </p>
            <div className="bg-card border border-border2 rounded-card p-7 mb-6">
              <div className="flex flex-col gap-3 mb-6">
                {PRICE_ANCHORS.map(({ label, cost }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted">{label}</span>
                    <span className={`font-mono text-xs font-semibold ${label === 'Calm Baby Blueprint' ? 'text-terra' : 'text-muted2 line-through'}`}>
                      {cost}
                    </span>
                  </div>
                ))}
              </div>
              <Button href={gumroadUrl} variant="primary" size="lg" external className="w-full">
                Get the Blueprint — $47
              </Button>
              <p className="text-center font-mono text-[10px] tracking-[0.08em] uppercase text-muted2 mt-3">
                One time · Instant access · Full refund available within 72 hours
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. Guarantee repeat ── */}
        <section className="bg-surface py-10">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <GuaranteeBlock showCTA />
          </div>
        </section>

        {/* ── 10. FAQ ── */}
        <FAQ />

        {/* ── 11. Final CTA ── */}
        <section className="bg-bg py-14 md:py-20 border-t border-border2">
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-4">
              You have already lost enough.{' '}
              <span className="text-terra">The risk is now zero.</span>
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Full refund if results do not show in 72 hours. You keep the
              Blueprint, the app, the soundscape, and the audio. Zero
              financial risk.
            </p>
            <Button href={gumroadUrl} variant="primary" size="lg" external>
              Get the Calm Baby Blueprint — $47
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
