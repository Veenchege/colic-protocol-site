/* ─── Types ──────────────────────────────────────────────────── */
export interface Citation {
  authors:  string          // e.g. 'Savino et al.'
  journal:  string          // e.g. 'Pediatrics'
  year:     number          // e.g. 2010
  finding:  string          // one-sentence summary of the key finding
  detail?:  string          // optional: study type / sample size
  url?:     string          // optional: PubMed or journal link
}

interface CitationCardProps {
  citation:   Citation
  className?: string
  compact?:   boolean       // compact = no detail line, smaller padding
}

/* ─── Component ──────────────────────────────────────────────── */
export default function CitationCard({
  citation,
  className = '',
  compact   = false,
}: CitationCardProps) {
  const { authors, journal, year, finding, detail, url } = citation

  const card = (
    <div
      className={[
        'bg-card border border-border2 rounded-card',
        compact ? 'p-5' : 'p-6',
        'flex flex-col gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header row: authors · journal · year */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-serif font-semibold text-brown text-sm leading-snug">
          {authors}
        </span>
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra">
          {journal} · {year}
        </span>
      </div>

      {/* Finding */}
      <p className="font-serif text-[13px] leading-relaxed text-muted italic">
        "{finding}"
      </p>

      {/* Optional detail line */}
      {!compact && detail && (
        <p className="font-mono text-[9px] tracking-[0.06em] uppercase text-muted2">
          {detail}
        </p>
      )}
    </div>
  )

  /* If a URL is provided, wrap the card in an accessible anchor */
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group hover:no-underline"
        aria-label={`Read: ${authors} — ${journal} ${year}`}
      >
        <div className="group-hover:border-terra/40 transition-colors duration-150">
          {card}
        </div>
      </a>
    )
  }

  return card
}

/* ─── Pre-built citation data ─────────────────────────────────── */
// Import and spread these wherever the science section appears.
// Keeps citation data in one place — update here, reflects everywhere.

export const CITATIONS: Citation[] = [
  {
    authors: 'Savino et al.',
    journal: 'Pediatrics',
    year:    2010,
    finding:
      '74% reduction in daily crying time by Day 21 using L. reuteri DSM 17938 versus placebo in breastfed infants with colic.',
    detail:
      'Double-blind, placebo-controlled RCT · 46 breastfed infants · Primary outcome: crying duration',
    url:
      'https://pubmed.ncbi.nlm.nih.gov/20921208/',
  },
  {
    authors: 'Ellwood et al.',
    journal: 'BMJ Open',
    year:    2020,
    finding:
      'L. reuteri DSM 17938 carries the strongest evidence base of any reviewed intervention for infant colic.',
    detail:
      'Systematic review of reviews · Multiple RCTs analysed · Independent of Savino 2010',
    url:
      'https://pubmed.ncbi.nlm.nih.gov/32972882/',
  },
  {
    authors: 'Hjern et al.',
    journal: 'Acta Paediatrica',
    year:    2020,
    finding:
      'Moderate to strong evidence across multiple independent RCTs for reduced crying duration with L. reuteri DSM 17938.',
    detail:
      'Independent systematic review · Confirms Ellwood 2020 findings · Separate research group',
    url:
      'https://pubmed.ncbi.nlm.nih.gov/31960974/',
  },
  {
    authors: 'Liao et al.',
    journal: 'Scientific Reports',
    year:    2026,
    finding:
      'Untreated colic is associated with elevated risk of long-term gut-brain axis disruption (association, not proven causation).',
    detail:
      'Nationwide study · Note: association only — language of causation is not supported by this study',
  },
]
