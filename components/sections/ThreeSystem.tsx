const SYSTEMS = [
  {
    num:      '01',
    tag:      'Gut inflammation',
    headline: 'L. reuteri DSM 17938',
    body:
      'Gut microbiome imbalance drives a fermentation loop that produces gas and pain continuously. Simethicone treats the gas bubble. The Blueprint corrects the microbial environment producing it. Savino et al., Pediatrics 2010: 74% reduction in daily crying by Day 21.',
    detail:   'Strain name: L. reuteri DSM 17938 (BioGaia Protectis). Not a generic probiotic. This exact strain.',
    colour:   'text-terra',
    border:   'border-terra/30',
    bg:       'bg-terra/5',
  },
  {
    num:      '02',
    tag:      'Nervous system dysregulation',
    headline: 'Tiger Hold + Brown Noise',
    body:
      'The Moro startle reflex activates at baseline — your baby cannot self-regulate. The Tiger Hold at 60 BPM deactivates the reflex while moving trapped gas. Brown noise at womb frequency (60–65dB) signals neurological safety. Sound first, then touch. Sequence matters.',
    detail:   'Brown noise only. White noise sits above womb frequency range and overstimulates a dysregulated nervous system.',
    colour:   'text-purple',
    border:   'border-purple/30',
    bg:       'bg-purple/5',
  },
  {
    num:      '03',
    tag:      'Feeding mechanics',
    headline: 'Paced feeding / latch correction',
    body:
      'Air ingestion at every feed compounds the gas load. A correct latch or paced bottle position eliminates the air intake at the source. For formula-fed infants: baby near-upright, bottle horizontal, pause every 20–30 seconds. For breastfed: four-point latch check.',
    detail:   'Applies to both breastfed and formula-fed infants — different correction, same outcome.',
    colour:   'text-sage',
    border:   'border-sage/30',
    bg:       'bg-sage/5',
  },
]

export default function ThreeSystem() {
  return (
    <section
      className="py-16 md:py-24 bg-surface"
      aria-labelledby="system-heading"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="mb-12 max-w-2xl mx-auto text-center">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center justify-center gap-2">
            <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
            The mechanism
          </p>
          <h2
            id="system-heading"
            className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-4"
          >
            Colic is not one problem.{' '}
            <span className="text-terra">
              It is three simultaneous system failures.
            </span>
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Single-remedy approaches fail by design. Each one addresses one
            output of a three-mechanism condition. The protocol addresses all
            three simultaneously — in the correct sequence.
          </p>
        </div>

        {/* System cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SYSTEMS.map(({ num, tag, headline, body, detail, colour, border, bg }) => (
            <article
              key={num}
              className={`rounded-card border ${border} ${bg} p-6 flex flex-col gap-4`}
            >
              {/* Number + tag */}
              <div className="flex items-center gap-3">
                <span
                  className={`font-serif font-bold text-3xl leading-none ${colour}`}
                >
                  {num}
                </span>
                <span className={`font-mono text-[9px] tracking-[0.1em] uppercase ${colour}`}>
                  {tag}
                </span>
              </div>

              {/* Protocol name */}
              <h3 className="font-serif font-semibold text-brown text-lg leading-snug">
                {headline}
              </h3>

              {/* Explanation */}
              <p className="text-xs text-muted leading-relaxed flex-1">{body}</p>

              {/* Detail note */}
              <p className={`font-mono text-[9px] tracking-[0.06em] leading-relaxed ${colour} border-t ${border} pt-3`}>
                {detail}
              </p>
            </article>
          ))}
        </div>

        {/* Closing statement */}
        <p className="mt-10 text-center font-mono text-[10px] tracking-[0.1em] uppercase text-muted2">
          All three systems must run simultaneously · Sequence determines effectiveness
        </p>
      </div>
    </section>
  )
}
