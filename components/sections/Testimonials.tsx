import { testimonials, hasTestimonials, type TestimonialSource } from '@/lib/testimonials'

/**
 * Renders nothing when testimonials array is empty.
 * Ships in production with zero testimonials displayed.
 * Add entries to lib/testimonials.ts and redeploy — section appears automatically.
 */
export default function Testimonials() {
  if (!hasTestimonials) return null

  return (
    <section
      className="py-16 md:py-24 bg-surface"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="mb-10 max-w-xl">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
            Results
          </p>
          <h2
            id="testimonials-heading"
            className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug"
          >
            Not miracles.{' '}
            <span className="text-terra">
              Correct protocol applied to the correct root cause.
            </span>
          </h2>
        </div>

        {/* Cards — single testimonial gets a constrained, centered width
            instead of stretching into an empty 3-column grid */}
        <div
          className={
            testimonials.length === 1
              ? 'max-w-md'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
          }
        >
          {testimonials.map(({ id, quote, name, detail, result, source }) => (
            <figure
              key={id}
              className="bg-card border border-border2 rounded-card p-7 flex flex-col gap-4"
            >
              {/* Quote */}
              <blockquote>
                <p className="font-serif italic text-brown text-base leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
              </blockquote>

              {/* Attribution */}
              <figcaption className="flex flex-col gap-1.5 border-t border-border pt-4 mt-auto">
                <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted2">
                  {name}{detail ? ` · ${detail}` : ''}
                </p>
                {result && (
                  <p className="text-xs text-terra font-medium">{result}</p>
                )}
                <p className="font-mono text-[8px] tracking-[0.08em] uppercase text-muted2/70">
                  {SOURCE_LABELS[source]}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─── Honest source labels ───────────────────────────────────── */
// Displayed small, at the bottom of each card, so a reader can tell
// the difference between a Blueprint buyer result and a comment on
// free content. Do not remove this — it's what keeps the section honest.
const SOURCE_LABELS: Record<TestimonialSource, string> = {
  dm:                 'Direct message',
  instagram_comment:  'Instagram comment',
  email_reply:        'Email reply',
  gumroad_review:      'Gumroad review',
}
