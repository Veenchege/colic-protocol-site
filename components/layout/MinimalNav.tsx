import Link from 'next/link'

/* ─── Types ──────────────────────────────────────────────────── */
interface MinimalNavProps {
  /**
   * Whether the logo links back to homepage.
   * Set to false on the quiz page to prevent mid-quiz escape.
   * Default: true (logo always links home unless explicitly disabled).
   */
  logoLinksHome?: boolean
}

/* ─── Component ──────────────────────────────────────────────── */
export default function MinimalNav({ logoLinksHome = true }: MinimalNavProps) {
  return (
    <header
      className="w-full bg-surface/90 backdrop-blur-sm border-b border-border2"
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center">
        {logoLinksHome ? (
          <Link
            href="/"
            className="font-serif text-lg font-semibold text-brown tracking-tight"
            aria-label="Colic Protocol — return to homepage"
          >
            Colic Protocol
          </Link>
        ) : (
          /* Non-linked logo — prevents mid-quiz navigation */
          <span
            className="font-serif text-lg font-semibold text-brown tracking-tight"
            aria-label="Colic Protocol"
          >
            Colic Protocol
          </span>
        )}
      </div>
    </header>
  )
}
