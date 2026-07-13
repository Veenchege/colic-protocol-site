import { testimonials, hasTestimonials, type TestimonialSource } from '@/lib/testimonials'

/**
 * Renders nothing when testimonials array is empty.
 * Ships in production with zero testimonials displayed.
 * Add entries to lib/testimonials.ts and redeploy — section appears automatically.
 */
export default function Testimonials() {
  if (!hasTestimonials) return null

  return (
    <section className="py-16 md:py-24 bg-warm" aria-labelledby="testimonials-heading">
      <div className="max-w-5xl mx-auto px-6 md:px-12">

        <div className="mb-10 max-w-xl">
          <h2
            id="testimonials-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight"
          >
            Not miracles.{' '}
            <span className="text-terra">Correct protocol applied to the correct root cause.</span>
          </h2>
        </div>

        <div className={testimonials.length === 1 ? 'max-w-md' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
          {testimonials.map(({ id, quote, name, detail, result, source }) => (
            <figure key={id} className="bg-card border border-border2 rounded-card p-7 flex flex-col gap-4">
              <blockquote>
                <p className="font-serif italic text-brown text-lg leading-relaxed">&ldquo;{quote}&rdquo;</p>
              </blockquote>

              <figcaption className="flex flex-col gap-1.5 border-t border-border pt-4 mt-auto">
                <p className="text-sm font-medium text-brown">
                  {name}{detail ? ` · ${detail}` : ''}
                </p>
                {result && <p className="text-sm text-terra font-medium">{result}</p>}
                <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-muted2/80">
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

/* Displayed small, at the bottom of each card, so a reader can tell the
   difference between a Blueprint buyer result and a comment on free
   content. Do not remove this — it's what keeps the section honest. */
const SOURCE_LABELS: Record<TestimonialSource, string> = {
  dm:                'Direct message',
  instagram_comment: 'Instagram comment',
  email_reply:       'Email reply',
  gumroad_review:     'Gumroad review',
}
