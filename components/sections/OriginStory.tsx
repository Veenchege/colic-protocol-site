export default function OriginStory() {
  return (
    <section
      className="py-16 md:py-24 bg-bg"
      aria-labelledby="origin-heading"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* ── Left: Story ── */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center justify-center md:justify-start gap-2 text-center md:text-left">
              <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
              Why this exists
            </p>

            <h2
              id="origin-heading"
              className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-8 text-center md:text-left"
            >
              Week 3. My daughter Zion had been crying for six hours.
            </h2>

            <div className="flex flex-col gap-5 text-sm md:text-[15px] text-muted leading-relaxed">
              <p>
                I had tried gripe water. I had tried gas drops. I had tried
                every position and sound I could find online. My wife and I
                were taking shifts at 2AM, neither of us sleeping more than
                ninety minutes at a stretch. Our pediatrician told us to wait
                it out.
              </p>
              <p>
                As an Epidemiologist and Health Data Analyst, I treated it the
                only way I know how — as a data problem. I went back to the
                primary literature. What I found changed everything.
              </p>
              <p>
                Infant colic is not a single-system problem. It is three
                systems failing simultaneously: gut microbiome imbalance
                driving inflammation, nervous system dysregulation keeping the
                infant in a chronic threat state, and an acoustic environment
                that is actively overstimulating an undeveloped nervous system.
                Single-remedy approaches fail by design.
              </p>
              <p>
                I built a sequenced protocol targeting all three systems.
                Within 48 hours, Zion slept for four consecutive hours for the
                first time in three weeks.
              </p>
              <p className="italic text-brown">
                I did not create this to build a business. I created it because
                this information exists in the published literature, it works,
                and no one had assembled it into a form a parent at 3AM could
                actually use.
              </p>
            </div>
          </div>

          {/* ── Right: Credentials ── */}
          <div className="flex flex-col gap-6">

            {/* Credential card */}
            <div className="bg-card border border-border2 rounded-card p-7">
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 mb-4">
                Founder
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-serif font-semibold text-brown text-lg">
                    Vincent
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-terra">
                    Epidemiologist & Health Data Analyst
                  </p>
                </div>

                <div className="border-t border-border pt-3 flex flex-col gap-2">
                  {[
                    'Epidemiologist — trained in evidence synthesis and systematic review',
                    'Health Data Analyst — treats clinical decisions as data problems',
                    'Father of Zion — resolved her colic using this protocol in 48 hours',
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-2">
                      <span
                        className="w-1 h-1 rounded-full bg-terra mt-1.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-xs text-muted leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Positioning statement */}
            <div className="bg-terra/5 border border-terra/20 rounded-card p-6">
              <p className="font-serif italic text-brown text-base leading-relaxed">
                &ldquo;The research on what actually works for infant colic has
                existed since 2010. It has just never been packaged for a
                parent at 3AM. That is what the free checklist is.&rdquo;
              </p>
              <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-terra mt-3">
                — Vincent, Colic Protocol
              </p>
            </div>

            {/* Authority signal */}
            <div className="bg-card border border-border2 rounded-card p-6">
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 mb-3">
                Evidence base
              </p>
              <p className="text-xs text-muted leading-relaxed">
                Built on Savino et al. (Pediatrics 2010), confirmed by two
                independent 2020 systematic reviews (BMJ Open · Acta
                Paediatrica) and a 2026 nationwide study (Scientific Reports).
                Not a mommy-blog ebook. A protocol built from the primary
                literature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
