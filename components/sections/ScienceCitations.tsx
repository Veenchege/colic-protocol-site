import CitationCard, { CITATIONS } from '@/components/ui/CitationCard'

export default function ScienceCitations() {
  return (
    <section
      className="py-16 md:py-24 bg-surface"
      aria-labelledby="science-heading"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
            The evidence
          </p>
          <h2
            id="science-heading"
            className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug"
          >
            This is not one study from 2010.{' '}
            <span className="text-terra">
              It is a converging body of research across 16 years.
            </span>
          </h2>
        </div>

        {/* Citation grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CITATIONS.map((citation) => (
            <CitationCard key={`${citation.authors}-${citation.year}`} citation={citation} />
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-6 font-mono text-[10px] tracking-[0.08em] text-muted2 leading-relaxed max-w-2xl">
          Note on Liao et al. 2026: this study demonstrates association between
          untreated colic and gut-brain axis disruption — not proven causation.
          The language of causation is not supported by this study design.
        </p>
      </div>
    </section>
  )
}
