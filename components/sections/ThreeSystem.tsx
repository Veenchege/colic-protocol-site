const SYSTEMS = [
  {
    num:      '01',
    tag:      'Gut inflammation',
    headline: 'L. reuteri DSM 17938',
    body:
      'Gut microbiome imbalance drives a fermentation loop that produces gas and pain continuously. Simethicone treats the gas bubble. The Blueprint corrects the microbial environment producing it. Savino et al., Pediatrics 2010: 74% reduction in daily crying by Day 21.',
    detail:   'Strain name: L. reuteri DSM 17938 (BioGaia Protectis). Not a generic probiotic. This exact strain.',
    colour:   'text-terra',
    bar:      'bg-terra',
  },
  {
    num:      '02',
    tag:      'Nervous system dysregulation',
    headline: 'Tiger Hold + Brown Noise',
    body:
      'The Moro startle reflex activates at baseline — your baby cannot self-regulate. The Tiger Hold at 60 BPM deactivates the reflex while moving trapped gas. Brown noise at womb frequency (60–65dB) signals neurological safety. Sound first, then touch. Sequence matters.',
    detail:   'Brown noise only. White noise sits above womb frequency range and overstimulates a dysregulated nervous system.',
    colour:   'text-mauve',
    bar:      'bg-mauve',
  },
  {
    num:      '03',
    tag:      'Feeding mechanics',
    headline: 'Paced feeding / latch correction',
    body:
      'Air ingestion at every feed compounds the gas load. A correct latch or paced bottle position eliminates the air intake at the source. For formula-fed infants: baby near-upright, bottle horizontal, pause every 20–30 seconds. For breastfed: four-point latch check.',
    detail:   'Applies to both breastfed and formula-fed infants — different correction, same outcome.',
    colour:   'text-sage',
    bar:      'bg-sage',
  },
]

export default function ThreeSystem() {
  return (
    <section className="py-16 md:py-24 bg-surface" aria-labelledby="system-heading">
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        <div className="mb-14 max-w-2xl">
          <p className="kicker mb-4">The mechanism</p>
          <h2
            id="system-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight mb-4"
          >
            Colic is not one problem. It is three simultaneous system failures.
          </h2>
          <p className="text-[17px] text-muted leading-relaxed">
            Single-remedy approaches fail by design. Each one addresses one output of a
            three-mechanism condition. The protocol addresses all three simultaneously —
            in the correct sequence.
          </p>
        </div>

        {/* Differential list, not a card grid — reads like a triage note,
            not a SaaS feature comparison. */}
        <div className="flex flex-col">
          {SYSTEMS.map(({ num, tag, headline, body, detail, colour, bar }, i) => (
            <article
              key={num}
              className={`grid grid-cols-[auto_1fr] md:grid-cols-[88px_1fr] gap-6 md:gap-10 py-9
                          ${i !== 0 ? 'border-t border-border2' : ''}`}
            >
              <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-2">
                <span className={`font-serif font-bold text-[40px] md:text-[52px] leading-none ${colour}`}>
                  {num}
                </span>
                <span className={`hidden md:block w-8 h-1 rounded-full ${bar}`} aria-hidden="true" />
              </div>

              <div>
                <p className={`font-mono text-[11px] tracking-[0.08em] uppercase ${colour} mb-2`}>
                  {tag}
                </p>
                <h3 className="font-sans font-bold text-brown text-xl md:text-2xl tracking-tight mb-3">
                  {headline}
                </h3>
                <p className="text-[15px] text-muted leading-relaxed max-w-[64ch] mb-4">
                  {body}
                </p>
                <p className={`text-sm leading-relaxed ${colour} font-medium`}>
                  {detail}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 pt-9 border-t border-border2 text-center font-mono text-[11px] tracking-[0.08em] uppercase text-muted2">
          All three systems must run simultaneously · Sequence determines effectiveness
        </p>
      </div>
    </section>
  )
}
