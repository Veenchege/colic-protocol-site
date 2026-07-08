const TRUST_POINTS = [
  { stat: '71+',   label: 'Protocols downloaded' },
  { stat: '20+',   label: 'Countries' },
  { stat: '3',     label: 'Independent peer-reviewed studies' },
]

export default function TrustBar() {
  return (
    <div className="border-y border-border2 bg-surface">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {TRUST_POINTS.map(({ stat, label }) => (
            <li
              key={label}
              className="flex items-center gap-3"
            >
              <span className="font-serif font-bold text-terra text-2xl leading-none">
                {stat}
              </span>
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted2 leading-tight max-w-[100px]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
