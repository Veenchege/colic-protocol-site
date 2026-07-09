import Button from '@/components/ui/Button'

export default function Hero() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <section
      className="relative bg-bg overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Warm radial gradient — purely decorative */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 15% 20%, rgba(196,96,58,0.07) 0%, transparent 65%),' +
            'radial-gradient(ellipse 50% 50% at 85% 80%, rgba(92,122,95,0.05) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-terra mb-6 flex items-center justify-center gap-2">
          <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
          Evidence-based infant colic management
        </p>

        {/* Headline */}
        <h1
          id="hero-headline"
          className="font-serif font-bold text-brown leading-[1.06] tracking-tight mb-6
                     text-[clamp(36px,7vw,68px)] max-w-[14ch] mx-auto"
        >
          Stop guessing what&apos;s wrong.{' '}
          <em className="text-terra not-italic">Start with the science.</em>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg text-muted leading-relaxed mb-10 max-w-[46ch] mx-auto">
          A 2-minute symptom test identifies which of three root systems is
          driving your baby&apos;s colic — and delivers the exact protocol to
          run tonight. Free.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/quiz" variant="primary" size="lg">
            Find your baby&apos;s colic type — free
          </Button>

          <a
            href={gumroadChecklist}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted underline underline-offset-4
                       hover:text-terra transition-colors duration-150"
          >
            or download the 3AM checklist directly
          </a>
        </div>

        {/* Micro social proof */}
        <p className="mt-8 font-mono text-[10px] tracking-[0.1em] uppercase text-muted2">
          71+ protocols downloaded · 20+ countries · No credit card required
        </p>
      </div>
    </section>
  )
}
