'use client'

import { useEffect, useState } from 'react'

const SCAN_ITEMS = [
  'Evaluating gut microbiome presentation',
  'Mapping nervous system dysregulation signals',
  'Assessing acoustic environment factors',
]

export default function QuizAnalyzing({ onDone }: { onDone: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const timers = SCAN_ITEMS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 500 + i * 700)
    )
    const done = setTimeout(onDone, 500 + SCAN_ITEMS.length * 700 + 500)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [onDone])

  return (
    <div className="flex flex-col items-center text-center gap-6 py-10">
      <p className="font-serif font-semibold text-brown text-xl leading-snug">
        Generating your report...
      </p>
      <p className="text-xs text-muted2 leading-relaxed max-w-xs">
        Mapping your answers against the three colic root-cause systems from
        peer-reviewed clinical literature.
      </p>

      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-terra animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-sm" role="status" aria-live="polite">
        {SCAN_ITEMS.map((item, i) => (
          <div
            key={item}
            className={[
              'text-xs text-muted px-4 py-2.5 rounded-card bg-surface border border-border2',
              'transition-opacity duration-300',
              i < visibleCount ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
