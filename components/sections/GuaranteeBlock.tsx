import Button from '@/components/ui/Button'

/* ─── Types ──────────────────────────────────────────────────── */
interface GuaranteeBlockProps {
  /** Show the Blueprint CTA button — use on homepage/about, not on the Blueprint page itself */
  showCTA?:   boolean
  /** Compact mode — less padding, smaller type. For use inside other cards. */
  compact?:   boolean
  className?: string
}

/* ─── Component ──────────────────────────────────────────────── */
export default function GuaranteeBlock({
  showCTA   = false,
  compact   = false,
  className = '',
}: GuaranteeBlockProps) {
  return (
    <div
      className={[
        'border border-terra/40 rounded-card bg-terra/5',
        compact ? 'p-5' : 'p-6 md:p-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="note"
      aria-label="Results commitment"
    >
      {/* Eyebrow */}
      <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-terra mb-3 text-center">
        The 72-Hour Guarantee
      </p>

      {/* Headline */}
      <h3
        className={[
          'font-serif font-semibold text-brown leading-snug mb-3 text-center',
          compact ? 'text-base' : 'text-xl md:text-2xl',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        Parents who implement this protocol typically see measurable
        reduction in crying duration within 72 hours.
      </h3>

      {/* Body */}
      <p
        className={[
          'text-muted leading-relaxed mb-4',
          compact ? 'text-xs' : 'text-sm',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        If you don&apos;t — email Vincent directly. Full refund. No forms,
        no questions, no waiting. You keep the Blueprint, the Bloom Baby
        Tracker app, the brown noise soundscape, and the Cry Decoder
        audio. Every component. Zero financial risk.
      </p>

      {/* Supporting details */}
      <ul
        className={[
          'flex flex-wrap justify-center gap-x-6 gap-y-1 mb-4',
          compact ? 'text-[10px]' : 'text-xs',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {[
          '$47 — one time, no subscription',
          'Full refund within 72 hours if results don\'t show',
          'Keep everything either way',
          '20+ countries',
        ].map((item) => (
          <li
            key={item}
            className="flex items-center gap-1.5 text-muted font-mono tracking-wide uppercase text-[9px]"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-terra flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {/* Optional CTA */}
      {showCTA && (
        <div className="text-center">
          <Button href="/blueprint" variant="primary" size="md">
            Get the $47 Blueprint
          </Button>
        </div>
      )}
    </div>
  )
}
