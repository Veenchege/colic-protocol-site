import Button from '@/components/ui/Button'

export default function FinalCTA() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <section
      className="py-16 md:py-24 bg-bg border-t border-border2"
      aria-labelledby="final-cta-heading"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">

        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-6 flex items-center justify-center gap-2">
          <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
          Start tonight
        </p>

        <h2
          id="final-cta-heading"
          className="font-serif font-bold text-brown text-3xl md:text-[44px] leading-snug mb-4 max-w-2xl mx-auto"
        >
          The protocol takes{' '}
          <span className="text-terra">15 minutes to read.</span>
        </h2>

        <p className="text-muted text-sm md:text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Take the 2-minute quiz to get a protocol personalised to your
          baby&apos;s colic type — or download the checklist directly and use
          it tonight.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/quiz" variant="primary" size="lg">
            Find your baby&apos;s colic type — free
          </Button>

          <a
            href={gumroadChecklist}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted underline underline-offset-4 hover:text-terra transition-colors duration-150"
          >
            or download the checklist directly
          </a>
        </div>

        <p className="mt-6 font-mono text-[10px] tracking-[0.1em] uppercase text-muted2">
          No credit card · No subscription · Free forever
        </p>
      </div>
    </section>
  )
}
