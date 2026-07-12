/* ─── Types ──────────────────────────────────────────────────── */
export interface Citation {
  authors:  string
  journal:  string
  year:     number
  finding:  string
  detail?:  string
  url?:     string
}

interface CitationCardProps {
  citation:   Citation
  className?: string
  compact?:   boolean
}

/* ─── Component ──────────────────────────────────────────────── */
export default function CitationCard({ citation, className = '', compact = false }: CitationCardProps) {
  const { authors, journal, year, finding, detail, url } = citation

  const card = (
    <div
      className={[
        'bg-card border border-border2 rounded-card',
        compact ? 'p-5' : 'p-7',
        'flex flex-col gap-3',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="font-semibold text-brown text-[15px] leading-snug">{authors}</span>
        <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-terra">
          {journal} · {year}
        </span>
      </div>

      <p className="font-serif text-[16px] leading-relaxed text-brown/85 italic">
        &ldquo;{finding}&rdquo;
      </p>

      {!compact && detail && (
        <p className="text-xs text-muted2 leading-relaxed pt-2 border-t border-border">
          {detail}
        </p>
      )}
    </div>
  )

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group hover:no-underline"
        aria-label={`Read: ${authors} — ${journal} ${year}`}
      >
        <div className="group-hover:border-terra/40 transition-colors duration-150 rounded-card">
          {card}
        </div>
      </a>
    )
  }

  return card
}

/* ─── Pre-built citation data ─────────────────────────────────── */
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
