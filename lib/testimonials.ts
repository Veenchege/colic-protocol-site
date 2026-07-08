/**
 * lib/testimonials.ts
 *
 * Add entries here as real permission-based testimonials come in.
 * The Testimonials component reads this array and renders nothing when
 * it is empty, so there is never a placeholder or dummy card in production.
 *
 * Field notes:
 *   - `detail` replaces the old required `country` field. Not every
 *     testimonial comes with a location — some come with "mum of an
 *     11-week-old," some come with nothing at all. Use whatever real
 *     descriptor you have. Do not invent a country to fill the field.
 *   - `source` records where the quote came from (DM, Instagram comment,
 *     email reply). This matters because a comment on a free organic post
 *     is not the same claim as a paying Blueprint customer's result — be
 *     honest about which one you're displaying.
 *   - `result` is optional and should only be filled when the person gave
 *     you a concrete, quotable outcome. Do not paraphrase a vague comment
 *     into a specific metric they did not state.
 */

export type ColiType = 'GUT' | 'NS' | 'ACOUSTIC' | 'MIXED'

export type TestimonialSource =
  | 'dm'
  | 'instagram_comment'
  | 'email_reply'
  | 'gumroad_review'

export interface Testimonial {
  id:         string
  quote:      string
  name:       string
  detail?:    string            // e.g. 'Mum of 11-week-old', or a country
  result?:    string            // only if they stated a concrete outcome
  source:     TestimonialSource
  coliType?:  ColiType
}

export const testimonials: Testimonial[] = [
  {
    id:     'cassie-reardon',
    quote:
      'I wish I came across your page 5 weeks ago. I\'ve had to learn majority of that information on my own from endless hours of research when I could have just read your blueprint.',
    name:   'Cassie',
    detail: 'Mum of an 11-week-old, USA',
    source: 'dm',
  },
]

export const hasTestimonials = testimonials.length > 0
