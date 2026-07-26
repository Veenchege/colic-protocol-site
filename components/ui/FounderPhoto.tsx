'use client'

/**
 * components/ui/FounderPhoto.tsx
 *
 * Split out of OriginStory.tsx. That component is a Server Component
 * (no interactivity needed for the story text itself, so it should stay
 * server-rendered), but the onError fallback here requires a function
 * prop on a DOM element, which Next.js App Router does not allow inside
 * a Server Component boundary. Isolating just this bit as a Client
 * Component keeps the rest of OriginStory server-rendered.
 *
 * Falls back to a "V." mark if /images/vincent.jpg has not been added
 * yet, so the layout never breaks either way.
 */
export default function FounderPhoto() {
  return (
    <div className="relative w-full aspect-[4/5] rounded-card overflow-hidden bg-card border border-border2">
      <img
        src="/images/vincent.jpg"
        alt="Vincent, epidemiologist and founder of Colic Protocol"
        className="w-full h-full object-cover"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const fallback = el.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = 'flex'
        }}
      />
      <div
        className="hidden absolute inset-0 items-center justify-center bg-terra/8"
        aria-hidden="true"
      >
        <span className="font-serif font-bold text-terra text-6xl">V.</span>
      </div>
    </div>
  )
}
