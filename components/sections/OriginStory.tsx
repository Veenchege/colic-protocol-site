'use client'
export default function OriginStory() {
  return (
    <section className="py-16 md:py-24 bg-warm" aria-labelledby="origin-heading">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-14 md:gap-16 items-start">

          {/* ── Left: Story ── */}
          <div>
            <h2
              id="origin-heading"
              className="font-serif font-semibold text-brown text-[32px] md:text-[42px] leading-[1.15] mb-8"
            >
              Week 3. My daughter Zion had been crying for six hours.
            </h2>

            <div className="flex flex-col gap-5 text-[16px] md:text-[17px] text-muted leading-relaxed">
              <p>
                I had tried gripe water. I had tried gas drops. I had tried every position
                and sound I could find online. My wife and I were taking shifts at 2AM,
                neither of us sleeping more than ninety minutes at a stretch. Our
                pediatrician told us to wait it out.
              </p>
              <p>
                As an Epidemiologist and Health Data Analyst, I treated it the only way I
                know how — as a data problem. I went back to the primary literature. What
                I found changed everything.
              </p>
              <p>
                Infant colic is not a single-system problem. It is three systems failing
                simultaneously: gut microbiome imbalance driving inflammation, nervous
                system dysregulation keeping the infant in a chronic threat state, and an
                acoustic environment actively overstimulating an undeveloped nervous
                system. Single-remedy approaches fail by design.
              </p>
              <p>
                I built a sequenced protocol targeting all three systems. Within 48 hours,
                Zion slept for four consecutive hours for the first time in three weeks.
              </p>
              <p className="font-serif italic text-brown text-lg mt-2">
                I did not create this to build a business. I created it because this
                information exists in the published literature, it works, and no one had
                assembled it into a form a parent at 3AM could actually use.
              </p>
            </div>
          </div>

          {/* ── Right: Founder ── */}
          <div className="flex flex-col gap-6">

            {/*
              Photo slot. Master Document v10 flags this as the single
              highest-trust asset currently missing from the site — add
              a real photo of Vincent at public/images/vincent.jpg
              (roughly 3:4, warm/natural, not a studio headshot — this
              audience distrusts polish). Falls back to an initial mark
              if the file isn't present yet so the layout never breaks.
            */}
            <div className="relative w-full aspect-[4/5] rounded-card overflow-hidden bg-card border border-border2">
              <img
                src="/images/vincent.jpg"
                alt="Vincent, epidemiologist and founder of Colic Protocol"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  const fallback = el.nextElementSibling as HTMLElement | null
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div
                className="hidden absolute inset-0 items-center justify-center bg-terra/8"
                aria-hidden="true"
              >
                <span className="font-serif font-bold text-terra text-6xl">V.</span>
              </div>
            </div>

            <div>
              <p className="font-serif font-semibold text-brown text-xl mb-1">Vincent</p>
              <p className="font-mono text-[11px] tracking-[0.06em] uppercase text-terra mb-4">
                Epidemiologist &amp; Health Data Analyst
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'Trained in evidence synthesis and systematic review',
                  'Treats clinical decisions as data problems',
                  'Father of Zion — resolved her colic using this protocol in 48 hours',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-terra mt-2 flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm text-muted leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border2 pt-6">
              <p className="text-sm text-muted leading-relaxed">
                Built on Savino et al. (Pediatrics 2010), confirmed by two independent 2020
                systematic reviews and a 2026 nationwide study. Not a mommy-blog ebook — a
                protocol built from the primary literature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
