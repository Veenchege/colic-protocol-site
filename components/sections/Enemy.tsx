const ENEMIES = [
  {
    name:    'Simethicone (gas drops)',
    parents: 'Breaks up gas bubbles. Reduces abdominal pain. Stops the crying.',
    reality:
      'Failed every randomised controlled trial it has entered for colic. The Cochrane review found no statistically significant benefit over placebo. It treats gas as a mechanical output — it cannot touch the inflammatory gut environment producing that gas.',
    citation: 'Cochrane Review · Simethicone vs placebo · No significant benefit',
  },
  {
    name:    'Gripe water',
    parents: 'Settles the stomach. Provides digestive relief.',
    reality:
      'Zero randomised controlled trials in over 150 years of continuous commercial sale. The temporary calm some parents observe is a brief sensory distraction — the baby stops crying because something tastes different, not because anything physiological changed.',
    citation: 'No RCT evidence for colic exists — across any formulation',
  },
  {
    name:    '"Wait it out"',
    parents: 'Reassurance that it resolves by 12 weeks.',
    reality:
      '90% of cases do resolve by 12 weeks. That is true. What your pediatrician cannot tell you in a 7-minute appointment: a 2026 nationwide study found untreated colic is associated with long-term gut-brain axis disruption. Waiting is not neutral.',
    citation: 'Liao et al. · Scientific Reports · 2026',
  },
]

export default function Enemy() {
  return (
    <section className="py-16 md:py-24 bg-paper" aria-labelledby="enemy-heading">
      <div className="max-w-5xl mx-auto px-6 md:px-12">

        <div className="mb-12 max-w-2xl">
          <p className="kicker mb-4">Why everything has failed</p>
          <h2
            id="enemy-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight mb-4"
          >
            Gripe water. Gas drops. <span className="text-terra">&ldquo;Wait it out.&rdquo;</span>{' '}
            Here is what the research shows.
          </h2>
          <p className="text-[17px] text-muted leading-relaxed">
            These are not failures of effort. They are failures of the tools. None of them
            have peer-reviewed evidence for colic — and the mechanism explains exactly why.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {ENEMIES.map(({ name, parents, reality, citation }) => (
            <article key={name} className="bg-card border border-border2 rounded-card p-7 flex flex-col gap-5">
              <h3 className="text-[15px] font-semibold text-brown leading-snug pb-4 border-b border-border">
                {name}
              </h3>

              <div className="flex items-start gap-2.5">
                <span className="mt-[3px] text-error/70 flex-shrink-0" aria-hidden="true">✕</span>
                <p className="text-sm text-muted2 leading-relaxed line-through decoration-muted2/40">
                  {parents}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-[3px] text-terra flex-shrink-0" aria-hidden="true">→</span>
                <p className="text-sm text-brown/90 leading-relaxed">{reality}</p>
              </div>

              <p className="font-mono text-[10px] tracking-[0.04em] text-muted2 mt-auto pt-4 border-t border-border">
                {citation}
              </p>
            </article>
          ))}
        </div>

        <p className="font-serif text-2xl md:text-[28px] text-brown text-center italic max-w-2xl mx-auto">
          &ldquo;You have not been failing. You have been given the wrong tools.&rdquo;
        </p>
      </div>
    </section>
  )
}
