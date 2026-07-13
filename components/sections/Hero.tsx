export default function Hero() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <section className="relative bg-night overflow-hidden" aria-labelledby="hero-headline">
      <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-12 items-center">

          <div>
            <h1
              id="hero-headline"
              className="font-serif font-medium text-cream-text leading-[1.05] tracking-tight mb-6
                         text-[clamp(34px,5.6vw,58px)] max-w-[13ch]"
            >
              Your baby isn&apos;t crying for{' '}
              <em className="italic text-terra not-italic md:italic">&ldquo;no reason.&rdquo;</em>
            </h1>

            <p className="text-[19px] md:text-[21px] text-cream-text/70 leading-[1.5] mb-8 max-w-[40ch]">
              Colic has three distinct root causes. Most advice treats it as one problem.
              The 2-minute assessment tells you which is driving tonight — and exactly
              what to do about it.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
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
                className="text-[15px] text-cream-text/55 underline underline-offset-4 hover:text-terra transition-colors duration-150"
              >
                or download the 3AM checklist directly
              </a>
            </div>

            <p className="font-mono text-[11px] tracking-[0.09em] uppercase text-cream-text/35">
              71+ protocols downloaded · 20+ countries · No credit card required
            </p>
          </div>

          {/* Signature graphic — three systems converging into one protocol.
              Not decoration: this is the literal "diagnosis before protocol"
              claim, shown before a single word of copy explains it. */}
          <div className="hidden md:block mt-6 md:mt-10" aria-hidden="true">
            <svg viewBox="0 -34 400 414" fill="none" className="w-full h-auto">
  <path d="M40 20 C 40 150, 190 200, 195 280" stroke="#c4603a" strokeWidth="2" opacity="0.85" />
  <path d="M200 10 C 200 130, 195 200, 197 280" stroke="#8a6a7a" strokeWidth="2" opacity="0.85" />
  <path d="M360 20 C 360 150, 205 200, 199 280" stroke="#5c7a5f" strokeWidth="2" opacity="0.85" />
  <circle cx="40" cy="20" r="4" fill="#c4603a" />
  <circle cx="200" cy="10" r="4" fill="#8a6a7a" />
  <circle cx="360" cy="20" r="4" fill="#5c7a5f" />
  <circle cx="198" cy="280" r="7" fill="#f2e8dc" />
  <line x1="198" y1="280" x2="198" y2="360" stroke="rgba(242,232,220,0.25)" strokeWidth="1.5" strokeDasharray="3 5" />

  <text x="40" y="-14" textAnchor="middle" className="font-mono text-[11px] tracking-[0.06em] uppercase" fill="#c4603a" opacity="0.9">
    Gut Microbiome
  </text>
  <text x="200" y="-14" textAnchor="middle" className="font-mono text-[11px] tracking-[0.06em] uppercase" fill="#8a6a7a" opacity="0.9">
    Nervous System
  </text>
  <text x="360" y="-14" textAnchor="middle" className="font-mono text-[11px] tracking-[0.06em] uppercase" fill="#5c7a5f" opacity="0.9">
    Feeding Mechanics
  </text>
</svg>
          </div>
        </div>
      </div>

      <div className="border-t border-night-line">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6">
          <ul className="flex flex-wrap items-center gap-x-12 gap-y-4">
            {[
              { stat: '71+', label: 'Protocols downloaded' },
              { stat: '20+', label: 'Countries' },
              { stat: '3',   label: 'Peer-reviewed studies' },
            ].map(({ stat, label }) => (
              <li key={label} className="flex items-baseline gap-3">
                <span className="font-serif font-semibold text-terra text-2xl leading-none">{stat}</span>
                <span className="font-mono text-[11px] tracking-[0.07em] uppercase text-cream-text/40">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
