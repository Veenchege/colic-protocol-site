import CitationCard, { CITATIONS } from '@/components/ui/CitationCard'

export default function ScienceCitations() {
  return (
    <section className="py-16 md:py-24 bg-paper" aria-labelledby="science-heading">
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        <div className="mb-10 max-w-2xl">
          <p className="kicker mb-4">The evidence</p>
          <h2
            id="science-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight"
          >
            This is not one study from 2010.{' '}
            <span className="text-terra">It is a converging body of research across 16 years.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CITATIONS.map((citation) => (
            <CitationCard key={`${citation.authors}-${citation.year}`} citation={citation} />
          ))}
        </div>

        <p className="mt-6 text-xs text-muted2 leading-relaxed max-w-2xl">
          Note on Liao et al. 2026: this study demonstrates association between untreated colic
          and gut-brain axis disruption — not proven causation. The language of causation is not
          supported by this study design.
        </p>
      </div>
    </section>
  )
}
