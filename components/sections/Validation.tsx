/**
 * New section — did not exist in the previous build.
 * The homepage previously jumped from Hero straight into evidence
 * (TrustBar → Enemy) with no moment where the reader feels recognised
 * before being asked to process citations. Ideal Client Persona v2
 * documents this exact emotional sequence (guilt, isolation, "wait it
 * out" fatigue) and Framework 3's carousel structure explicitly puts
 * validation before mechanism. The homepage had validation missing
 * entirely. Added here, kept short.
 */
const SIGNS = [
  'Evenings are the worst part of your day, every day',
  'Gripe water or gas drops helped once, then stopped working',
  'You\u2019ve been told "every baby is different" more times than you can count',
  'You\u2019re doing the 3AM search again, phone brightness turned all the way down',
]

export default function Validation() {
  return (
    <section className="py-16 md:py-24 bg-warm" aria-labelledby="validation-heading">
      <div className="max-w-3xl mx-auto px-5 md:px-8">

        <h2
          id="validation-heading"
          className="font-sans font-bold text-brown text-[28px] md:text-[36px] leading-[1.15] tracking-tight mb-9"
        >
          Does this sound like your evening?
        </h2>

        <ul className="flex flex-col gap-4 mb-10">
          {SIGNS.map((sign) => (
            <li key={sign} className="flex items-start gap-3.5">
              <span
                className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 border-terra/50 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="w-2 h-2 rounded-full bg-terra" />
              </span>
              <span className="text-[17px] text-brown leading-relaxed">{sign}</span>
            </li>
          ))}
        </ul>

        <p className="font-serif text-2xl md:text-[28px] text-brown leading-[1.35] italic">
          You haven&apos;t been failing. You&apos;ve been given generic advice
          for a problem that isn&apos;t generic.
        </p>
      </div>
    </section>
  )
}
