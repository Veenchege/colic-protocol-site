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
    <section
      className="py-16 md:py-24 bg-bg"
      aria-labelledby="enemy-heading"
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="mb-12 max-w-2xl mx-auto text-center">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center justify-center gap-2">
            <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
            Why everything has failed
          </p>
          <h2
            id="enemy-heading"
            className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-4"
          >
            Gripe water. Gas drops.{' '}
            <span className="text-terra">&ldquo;Wait it out.&rdquo;</span>{' '}
            Here is what the research shows.
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            These are not failure of effort. They are failure of the tools.
            None of them have peer-reviewed evidence for colic — and the
            mechanism explains exactly why.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {ENEMIES.map(({ name, parents, reality, citation }) => (
            <article
              key={name}
              className="bg-card border border-border2 rounded-card p-7 flex flex-col gap-4"
            >
              {/* Product name */}
              <h3 className="font-mono text-[10px] tracking-[0.12em] uppercase text-error">
                {name}
              </h3>

              {/* What parents think */}
              <div>
                <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-muted2 mb-1">
                  What parents expect
                </p>
                <p className="text-xs text-muted leading-relaxed italic">
                  &ldquo;{parents}&rdquo;
                </p>
              </div>

              {/* What the evidence shows */}
              <div>
                <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-muted2 mb-1">
                  What the evidence shows
                </p>
                <p className="text-xs text-muted leading-relaxed">{reality}</p>
              </div>

              {/* Citation */}
              <p className="font-mono text-[9px] tracking-[0.06em] text-muted2 mt-auto pt-3 border-t border-border">
                {citation}
              </p>
            </article>
          ))}
        </div>

        {/* Bottom line */}
        <p className="font-serif text-xl md:text-2xl text-brown text-center italic max-w-2xl mx-auto">
          &ldquo;You have not been failing. You have been given the wrong tools.&rdquo;
        </p>
      </div>
    </section>
  )
}
