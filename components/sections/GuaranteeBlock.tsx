import Button from '@/components/ui/Button'

interface GuaranteeBlockProps {
  showCTA?:   boolean
  compact?:   boolean
  className?: string
}

export default function GuaranteeBlock({ showCTA = false, compact = false, className = '' }: GuaranteeBlockProps) {
  return (
    <div
      className={[
        'border border-terra/35 rounded-card bg-card',
        compact ? 'p-6' : 'p-8 md:p-10',
        className,
      ].filter(Boolean).join(' ')}
      role="note"
      aria-label="Results commitment"
    >
      <p className="kicker mb-3">The 72-Hour Guarantee</p>

      <h3
        className={[
          'font-serif font-semibold text-brown leading-snug mb-4',
          compact ? 'text-lg' : 'text-2xl md:text-[28px]',
        ].filter(Boolean).join(' ')}
      >
        Parents who implement this protocol typically see measurable reduction
        in crying duration within 72 hours.
      </h3>

      <p className={['text-muted leading-relaxed mb-5', compact ? 'text-sm' : 'text-base'].join(' ')}>
        If you don&apos;t — email Vincent directly. Full refund. No forms, no questions,
        no waiting. You keep the Blueprint, the Bloom Baby Tracker app, the brown noise
        soundscape, and the Cry Decoder audio. Every component. Zero financial risk.
      </p>

      <ul className={['flex flex-wrap gap-x-6 gap-y-2 mb-5', compact ? 'text-xs' : 'text-sm'].join(' ')}>
        {[
          '$47 — one time, no subscription',
          'Full refund within 72 hours if results don\u2019t show',
          'Keep everything either way',
          '20+ countries',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2 text-muted">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terra flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {showCTA && (
        <Button href="/blueprint" variant="primary" size="md">
          Get the $47 Blueprint
        </Button>
      )}
    </div>
  )
}
