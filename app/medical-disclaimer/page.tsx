import type { Metadata } from 'next'
import MinimalNav from '@/components/layout/MinimalNav'
import Footer     from '@/components/layout/Footer'

export const metadata: Metadata = {
  title:  'Medical Disclaimer — Colic Protocol',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'July 1, 2026'

export default function MedicalDisclaimerPage() {
  return (
    <>
      <MinimalNav />
      <main id="main-content" className="bg-paper py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-12">

          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4">
            Legal
          </p>
          <h1 className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-2">
            Medical Disclaimer
          </h1>
          <p className="font-mono text-[10px] text-muted2 mb-10">
            Last updated: {LAST_UPDATED}
          </p>

          {/* Emergency box — leads the page */}
          <div className="bg-error/8 border border-error/30 rounded-card p-6 mb-10">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-error mb-2">
              If this is an emergency
            </p>
            <p className="text-sm text-brown leading-relaxed">
              If your baby has a fever above 38°C, difficulty breathing,
              blood in stool or vomit, appears limp or unresponsive, or you
              are concerned in any way about their immediate welfare, contact
              emergency services or go to the nearest emergency room
              immediately. Do not use this website, the free checklist, or
              the Calm Baby Blueprint as a substitute for emergency medical
              care.
            </p>
          </div>

          <div className="flex flex-col gap-8 text-sm text-muted leading-relaxed">

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                1. Not medical advice
              </h2>
              <p>
                Colic Protocol, the Midnight Emergency Checklist, and the
                Calm Baby Blueprint are informational and educational
                products. Nothing on this website or in these products
                constitutes medical advice, diagnosis, or treatment. This
                content does not create a doctor-patient relationship between
                you and Vincent, Colic Protocol, or any contributor to this
                website.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                2. Always consult a qualified professional
              </h2>
              <p>
                Always consult your pediatrician, family doctor, or another
                qualified healthcare professional before starting any new
                protocol, supplement, or technique for your infant, including
                any information referenced on this site. This applies even
                when the content cites peer-reviewed research. Published
                research describes population-level findings. It does not
                account for your baby&apos;s individual medical history.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                3. On the language we use
              </h2>
              <p>
                We describe our products as a &ldquo;management protocol&rdquo;
                or &ldquo;management system,&rdquo; not a cure or a medical
                treatment. Infant colic is a self-limiting condition that
                resolves for most infants by around 12 weeks of age
                regardless of intervention. Our content describes
                evidence-informed approaches to managing symptoms during that
                window. It does not claim to cure colic, and no claim on this
                site should be read that way.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                4. On the cited research
              </h2>
              <p className="mb-3">
                We reference specific peer-reviewed studies, including
                Savino et al. (Pediatrics, 2010), Ellwood et al. (BMJ Open,
                2020), Hjern et al. (Acta Paediatrica, 2020), and a 2026
                study in Scientific Reports. We link to and describe these
                studies as accurately as we can, but:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>Research findings describe group averages, not guarantees for any individual infant.</li>
                <li>Some findings (for example, the association between untreated colic and gut-brain axis disruption) describe correlation, not proven causation. We do not claim causation where a study does not establish it.</li>
                <li>The primary L. reuteri DSM 17938 evidence base was developed in breastfed infant populations. Formula-fed infants may respond differently, and our content notes this distinction where relevant.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                5. Supplements and products mentioned
              </h2>
              <p>
                Any specific product mentioned on this site (including
                probiotic strains such as L. reuteri DSM 17938) is referenced
                for informational purposes based on published research. We
                are not medical providers and do not prescribe. Consult your
                pediatrician before introducing any supplement to your
                infant, including probiotics.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                6. Individual results vary
              </h2>
              <p>
                Any outcomes, timelines, or testimonials referenced on this
                site describe individual experiences and are not a guarantee
                of results for any other infant or family. Infant colic has
                multiple potential contributing factors, and what helps one
                baby may not help another.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                7. Limitation of liability
              </h2>
              <p>
                To the fullest extent permitted by law, Colic Protocol and
                its founder are not liable for any decision made or action
                taken based on the content of this website or its products.
                Use of this site and its products is at your own discretion
                and risk.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                8. Contact
              </h2>
              <p>
                Questions about this disclaimer:{' '}
                <a href="mailto:hello@colicprotocol.baby" className="text-terra underline underline-offset-2">
                  hello@colicprotocol.baby
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
