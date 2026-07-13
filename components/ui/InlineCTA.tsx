import Button from '@/components/ui/Button'

interface InlineCTAProps {
  /** compact = less padding, used mid-article · default = full, used at post end */
  variant?: 'default' | 'compact'
}

export default function InlineCTA({ variant = 'default' }: InlineCTAProps) {
  const gumroadUrl =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  const isCompact = variant === 'compact'

  return (
    <aside
      className={[
        'bg-terra/5 border border-terra/25 rounded-card',
        'not-prose',                       // escape Tailwind prose styles
        isCompact ? 'px-5 py-4 my-8' : 'px-6 py-6 my-10',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Free checklist download"
    >
      {/* Eyebrow */}
      <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-terra mb-2">
        Free · Instant download
      </p>

      {/* Headline */}
      <p
        className={[
          'font-serif font-semibold text-brown leading-snug mb-2',
          isCompact ? 'text-base' : 'text-lg',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        Apply this tonight with the free 3AM Emergency Checklist.
      </p>

      {/* Body */}
      {!isCompact && (
        <p className="text-xs text-muted leading-relaxed mb-4">
          The Midnight Emergency Checklist (The Zion Protocol) puts this
          protocol into a four-stage triage format usable one-handed at 3AM.
          Brown noise first, Tiger Hold second, gas release sequence third.
          Free instant download.
        </p>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <Button
          href={gumroadUrl}
          variant="primary"
          size="sm"
          external
        >
          Download free checklist
        </Button>
        <Button
          href="/colic-code-quiz.html"
          variant="ghost"
          size="sm"
        >
          Or take the colic type quiz
        </Button>
      </div>
    </aside>
  )
}
