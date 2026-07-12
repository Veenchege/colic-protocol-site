const TRUST_POINTS = [
  { stat: '71+', label: 'Protocols downloaded' },
  { stat: '20+', label: 'Countries' },
  { stat: '3',   label: 'Independent peer-reviewed studies' },
]

export default function TrustBar() {
  return (
    <div className="border-b border-border2 bg-paper">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-6">
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {TRUST_POINTS.map(({ stat, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="font-serif font-bold text-terra text-[28px] leading-none">{stat}</span>
              <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted2 leading-tight max-w-[110px]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
