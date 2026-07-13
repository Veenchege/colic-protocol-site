const SYSTEMS = [
  {
    tag:      'Gut inflammation',
    headline: 'L. reuteri DSM 17938',
    body:
      'Gut microbiome imbalance drives a fermentation loop that produces gas and pain continuously. Simethicone treats the gas bubble. The Blueprint corrects the microbial environment producing it. Savino et al., Pediatrics 2010: 74% reduction in daily crying by Day 21.',
    detail:   'Not a generic probiotic. This exact strain: L. reuteri DSM 17938 (BioGaia Protectis).',
    colour:   'text-terra',
    dot:      'bg-terra',
  },
  {
    tag:      'Nervous system dysregulation',
    headline: 'Tiger Hold + brown noise',
    body:
      'The Moro startle reflex activates at baseline — your baby cannot self-regulate. The Tiger Hold at 60 BPM deactivates the reflex while moving trapped gas. Brown noise at womb frequency (60–65dB) signals neurological safety. Sound first, then touch.',
    detail:   'Brown noise only. White noise sits above womb frequency and overstimulates a dysregulated nervous system.',
    colour:   'text-mauve',
    dot:      'bg-mauve',
  },
  {
    tag:      'Feeding mechanics',
    headline: 'Paced feeding / latch correction',
    body:
      'Air ingestion at every feed compounds the gas load. A correct latch or paced bottle position eliminates the air intake at the source. For formula-fed infants: baby near-upright, bottle horizontal, pause every 20–30 seconds.',
    detail:   'Applies to both breastfed and formula-fed infants — different correction, same outcome.',
    colour:   'text-sage',
    dot:      'bg-sage',
  },
]

export default function ThreeSystem() {
  return (
    <section className="py-16 md:py-24 bg-paper" aria-labelledby="system-heading">
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        <div className="mb-10 max-w-2xl">
          <p className="kicker text-terra mb-4">The mechanism</p>
          <h2
            id="system-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight mb-4"
          >
            Colic is not one problem. It is three systems failing{' '}
            <span className="text-terra">at the same time.</span>
          </h2>
          <p className="text-[17px] text-muted leading-relaxed">
            Not a sequence — a simultaneous condition. Single-remedy approaches fail because
            each one only ever addresses one of the three.
          </p>
        </div>

        {/* Braid graphic — three threads meeting at one point, echoing the
            hero. No ordinal numbers here on purpose: numbering three things
            that explicitly run simultaneously contradicts the point being
            made. The checklist below (a genuine step-by-step sequence)
            keeps its numbers — this section doesn't. */}
        <svg viewBox="0 0 1120 56" width="100%" height="56" preserveAspectRatio="none" className="mb-2 hidden md:block" aria-hidden="true">
          <path d="M186 0 C 186 30, 560 30, 560 56" stroke="#c4603a" strokeWidth="1.5" fill="none" opacity="0.55" />
          <path d="M560 0 L 560 56" stroke="#8a6a7a" strokeWidth="1.5" fill="none" opacity="0.55" />
          <path d="M933 0 C 933 30, 560 30, 560 56" stroke="#5c7a5f" strokeWidth="1.5" fill="none" opacity="0.55" />
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border2">
          {SYSTEMS.map(({ tag, headline, body, detail, colour, dot }, i) => (
            <article
              key={tag}
              className={`p-7 pt-8 md:pt-9 ${i !== 0 ? 'border-t md:border-t-0 md:border-l border-border' : ''}`}
            >
              <span className={`inline-block w-3 h-3 rounded-full ${dot} mb-4`} aria-hidden="true" />
              <p className={`kicker ${colour} mb-3`}>{tag}</p>
              <h3 className="font-sans font-bold text-brown text-lg mb-3 tracking-tight">
                {headline}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-4">{body}</p>
              <p className={`text-[13px] leading-relaxed font-semibold ${colour}`}>{detail}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 pt-8 border-t border-border2 text-center font-mono text-[11px] tracking-[0.08em] uppercase text-muted2">
          All three systems run simultaneously · the protocol sequences the response, not the causes
        </p>
      </div>
    </section>
  )
}
