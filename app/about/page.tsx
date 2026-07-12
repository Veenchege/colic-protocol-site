import type { Metadata } from 'next'
import Header        from '@/components/layout/Header'
import Footer        from '@/components/layout/Footer'
import Button        from '@/components/ui/Button'
import CitationCard, { CITATIONS } from '@/components/ui/CitationCard'

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:       'The Science & The Founder — Colic Protocol',
  description: 'An Epidemiologist treated infant colic as a data problem. Here is the evidence base, the methodology, and what the research actually supports — including where it has limits.',
  robots:      { index: true, follow: true },
}

/* ─── What the evidence supports / does not support ─────────── */
const SUPPORTED = [
  'L. reuteri DSM 17938 reduces daily crying duration in breastfed infants — Savino et al. 2010, confirmed by two independent 2020 systematic reviews.',
  'Infant colic is associated with gut microbiome dysbiosis — elevated Proteobacteria, reduced Lactobacillus.',
  'The Moro startle reflex is an active dysregulation mechanism in colic infants — rhythmic vestibular stimulation at 60 BPM reduces its activation threshold.',
  'Low-frequency acoustic environments (brown noise range) align with womb frequency profiles and are associated with reduced infant arousal.',
  'Untreated colic is associated with elevated markers of gut-brain axis disruption — Liao et al. 2026.',
]

const NOT_SUPPORTED = [
  'Simethicone (gas drops) — failed Cochrane review, no benefit over placebo.',
  'Gripe water — zero RCTs across any formulation in 150+ years of commercial sale.',
  'Craniosacral therapy — heterogeneous evidence, insufficient for clinical recommendation.',
  'Chiropractic manipulation for colic — insufficient evidence, not recommended.',
  'Liao et al. 2026 proving causation — the study shows association only.',
]

/* ─── Page ───────────────────────────────────────────────────── */
export default function AboutPage() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <>
      <Header />

      <main id="main-content">

        {/* ── Hero ── */}
        <section className="bg-paper py-14 md:py-20 border-b border-border2">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              The founder & the evidence
            </p>
            <h1 className="font-serif font-bold text-brown text-3xl md:text-[48px] leading-snug mb-4">
              Treating infant colic{' '}
              <span className="text-terra">as a data problem.</span>
            </h1>
            <p className="text-muted text-base md:text-lg leading-relaxed max-w-prose">
              An Epidemiologist goes back to the primary literature when the
              medical system says wait. Here is the methodology, the evidence
              base, and an honest account of where the science has limits.
            </p>
          </div>
        </section>

        {/* ── Founder story ── */}
        <section className="bg-paper py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              {/* Credentials */}
              <div className="md:col-span-1">
                <div className="bg-card border border-border2 rounded-card p-6 sticky top-24">
                  <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 mb-4">
                    Founder
                  </p>
                  <p className="font-serif font-bold text-brown text-xl mb-1">
                    Vincent
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-terra mb-4">
                    Epidemiologist & Health Data Analyst
                  </p>
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    {[
                      'Epidemiologist — trained in systematic review and evidence synthesis',
                      'Health Data Analyst — treats clinical decisions as data problems',
                      'Father of Zion — resolved her colic in 48 hours using this protocol',
                    ].map((line) => (
                      <div key={line} className="flex gap-2 items-start">
                        <span className="w-1 h-1 rounded-full bg-terra flex-shrink-0 mt-1.5" aria-hidden="true" />
                        <p className="text-xs text-muted leading-relaxed">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Story */}
              <div className="md:col-span-2 flex flex-col gap-5 text-sm md:text-[15px] text-muted leading-relaxed">
                <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug">
                  Week 3. My daughter Zion had been crying for six hours.
                </h2>
                <p>
                  The medical system gave gripe water recommendations and told us to wait it out. My wife and I were taking shifts at 2AM. Neither of us had slept more than ninety minutes consecutively in three weeks.
                </p>
                <p>
                  As an Epidemiologist, I have one framework for problems I cannot solve: go back to the primary literature. That is what I did. What I found was a converging body of peer-reviewed research — a 2010 RCT in Pediatrics, confirmed by two independent 2020 systematic reviews — that no one had assembled into a form usable at 3AM.
                </p>
                <p>
                  The evidence pointed toward a three-system failure model: gut microbiome imbalance producing a fermentation loop, nervous system dysregulation maintaining a chronic threat state, and an acoustic environment that was actively overstimulating an undeveloped nervous system. Single-remedy approaches fail by design because they address one output of a multi-mechanism condition.
                </p>
                <p>
                  I built a sequenced protocol targeting all three systems simultaneously. Within 48 hours, Zion slept for four consecutive hours for the first time since she was born.
                </p>
                <p className="text-brown font-medium italic">
                  I did not build this to scale a business. I built it because this information exists in the published literature, it works, and no one had packaged it for a parent who needs it at 3AM.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The evidence base ── */}
        <section className="bg-surface py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              The four studies
            </p>
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-3">
              A converging body of research across 16 years.
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-prose">
              The protocol is not built on a single study from 2010. It is built on a line of independent research groups reaching the same conclusion across 16 years. Here is each study and what it specifically shows.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {CITATIONS.map((c) => (
                <CitationCard key={`${c.authors}-${c.year}`} citation={c} />
              ))}
            </div>
          </div>
        </section>

        {/* ── What the evidence supports / does not support ── */}
        <section className="bg-paper py-14 md:py-20">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-6 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              Honest limits of the evidence
            </p>
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-8">
              What the research supports — and what it does not.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Supported */}
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-success">
                  Supported by the evidence
                </p>
                {SUPPORTED.map((item) => (
                  <div key={item} className="flex gap-2 items-start">
                    <span className="text-success font-bold flex-shrink-0 mt-0.5">✓</span>
                    <p className="text-xs text-muted leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              {/* Not supported */}
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-error">
                  Not supported — explicitly excluded
                </p>
                {NOT_SUPPORTED.map((item) => (
                  <div key={item} className="flex gap-2 items-start">
                    <span className="text-error font-bold flex-shrink-0 mt-0.5">✗</span>
                    <p className="text-xs text-muted leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Dual CTA ── */}
        <section className="bg-surface py-14 md:py-20 border-t border-border2">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-4">
              Start with the free protocol. Tonight.
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-prose">
              The free checklist manages a colic episode using the same
              evidence base as the Blueprint. No email required. If you want
              the diagnostic decision tree and the full three-system
              sequencing architecture, the Blueprint is $47 with a full
              refund if results do not show in 72 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/quiz" variant="primary" size="md">
                Take the free colic type quiz
              </Button>
              <Button href={gumroadChecklist} variant="secondary" size="md" external>
                Download checklist directly
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
