import Button from '@/components/ui/Button'

export default function Hero() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <section className="relative bg-warm overflow-hidden" aria-labelledby="hero-headline">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 12% 15%, rgba(196,96,58,0.09) 0%, transparent 62%),' +
            'radial-gradient(ellipse 45% 45% at 88% 85%, rgba(92,122,95,0.07) 0%, transparent 58%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24">

        {/* Headline — no eyebrow kicker here. This is the emotional entry
            point, it doesn't need a mono label to earn attention. */}
        <h1
          id="hero-headline"
          className="font-serif font-semibold text-brown leading-[1.04] tracking-tight mb-7
                     text-[clamp(34px,6.4vw,60px)] max-w-[15ch]"
        >
          Your baby isn&apos;t crying for &ldquo;no reason.&rdquo;
        </h1>

        <p className="text-[19px] md:text-[21px] text-muted leading-[1.5] mb-4 max-w-[38ch]">
          Colic has three distinct root causes. Most advice treats it as one problem.
        </p>

        <p className="text-base md:text-lg text-muted leading-relaxed mb-10 max-w-[46ch]">
          The 2-minute assessment identifies which of the three is driving your
          baby&apos;s crying, then gives you the exact protocol to run tonight. Free.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Button href="/quiz" variant="primary" size="lg">
            Find your baby&apos;s colic type — free
          </Button>

          <a
            href={gumroadChecklist}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] text-muted underline underline-offset-4 hover:text-terra transition-colors duration-150"
          >
            or download the 3AM checklist directly
          </a>
        </div>

        <p className="mt-9 font-mono text-[11px] tracking-[0.09em] uppercase text-muted2">
          71+ protocols downloaded · 20+ countries · No credit card required
        </p>
      </div>
    </section>
  )
}
