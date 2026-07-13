export default function FinalCTA() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <section className="py-16 md:py-24 bg-night" aria-labelledby="final-cta-heading">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">

        <h2
          id="final-cta-heading"
          className="font-serif font-medium text-cream-text text-[32px] md:text-[46px] leading-[1.15] mb-5 max-w-2xl mx-auto"
        >
          The protocol takes <em className="italic text-terra">15 minutes</em> to read.
        </h2>

        <p className="text-cream-text/65 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Take the 2-minute quiz to get a protocol personalised to your baby&apos;s colic
          type — or download the checklist directly and use it tonight.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8">
          <a
            href="/quiz"
            className="inline-flex items-center justify-center rounded-btn bg-terra text-white font-semibold text-base px-8 py-4 min-h-[48px] hover:bg-[#a94f2f] transition-colors duration-150"
          >
            Find your baby&apos;s colic type — free
          </a>
          <a
            href={gumroadChecklist}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-btn border border-cream-text/30 text-cream-text font-semibold text-base px-8 py-4 min-h-[48px] hover:border-terra hover:text-terra transition-colors duration-150"
          >
            Download the checklist
          </a>
        </div>

        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-cream-text/35">
          No credit card · No subscription · Email required for delivery
        </p>
      </div>
    </section>
  )
}
