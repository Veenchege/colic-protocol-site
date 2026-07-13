import type { Metadata } from 'next'
import MinimalNav from '@/components/layout/MinimalNav'
import Footer     from '@/components/layout/Footer'

export const metadata: Metadata = {
  title:  'Terms of Use — Colic Protocol',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'July 1, 2026'

export default function TermsPage() {
  return (
    <>
      <MinimalNav />
      <main id="main-content" className="bg-paper py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-12">

          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4">
            Legal
          </p>
          <h1 className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-2">
            Terms of Use
          </h1>
          <p className="font-mono text-[10px] text-muted2 mb-10">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="flex flex-col gap-8 text-sm text-muted leading-relaxed">

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                1. Acceptance of terms
              </h2>
              <p>
                By using colicprotocol.baby, downloading the Midnight
                Emergency Checklist, or purchasing the Calm Baby Blueprint,
                you agree to these terms. If you do not agree, do not use
                this site or its products.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                2. What we sell
              </h2>
              <p>
                Colic Protocol sells digital, informational products. The
                Midnight Emergency Checklist is free. The Calm Baby Blueprint
                is a one-time purchase of $47, delivered digitally through
                Gumroad, and includes the core protocol document plus the
                bonuses described on the product page at time of purchase.
                There is no subscription and no recurring charge tied to the
                Blueprint.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                3. Purchases and payment
              </h2>
              <p>
                All purchases are processed by Gumroad. Gumroad handles
                payment information, receipts, and applicable tax collection.
                We do not store or have access to your payment card details.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                4. Results commitment and refunds
              </h2>
              <p className="mb-3">
                Parents who implement the full Blueprint protocol typically
                see a measurable reduction in crying duration within 72
                hours. If you do not see that result, email{' '}
                <a href="mailto:hello@colicprotocol.baby" className="text-terra underline underline-offset-2">
                  hello@colicprotocol.baby
                </a>{' '}
                and we will issue a full refund. There are no forms to fill
                out and no requirement to prove you followed the protocol
                exactly. You keep the Blueprint and all bonus materials
                whether or not you request a refund.
              </p>
              <p>
                This commitment applies to the Calm Baby Blueprint purchase
                only. The free checklist has no associated charge and
                therefore no refund applicable.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                5. Pricing
              </h2>
              <p>
                The price of the Calm Baby Blueprint is set at the time of
                purchase and displayed on the Gumroad checkout page. We do
                not run public discount codes or sales on this product. If
                the listed price ever changes, it applies going forward only,
                not retroactively to prior purchases.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                6. License to use the content
              </h2>
              <p>
                When you purchase the Blueprint or download the free
                checklist, we grant you a personal, non-transferable license
                to use the material for your own household. You may not
                resell, redistribute, republish, or share the files publicly,
                including posting the PDF, app access, or audio files to
                other websites, file-sharing services, or social media.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                7. No medical advice
              </h2>
              <p>
                All products and content on this site are informational only
                and are governed by our{' '}
                <a href="/medical-disclaimer" className="text-terra underline underline-offset-2">
                  Medical Disclaimer
                </a>
                , which is incorporated into these terms by reference.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                8. Availability and changes
              </h2>
              <p>
                We may update, modify, or discontinue any part of this
                website or its products at any time. We may also update these
                terms from time to time. The &ldquo;Last updated&rdquo; date
                above reflects the most recent revision. Continued use of the
                site after a change constitutes acceptance of the updated
                terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                9. Limitation of liability
              </h2>
              <p>
                To the fullest extent permitted by law, Colic Protocol and
                its founder are not liable for indirect, incidental, or
                consequential damages arising from use of this site or its
                products. Our total liability for any claim related to a
                purchase is limited to the amount you paid for that purchase.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                10. Governing law
              </h2>
              <p>
                These terms are governed by the laws applicable in the
                founder&apos;s place of business, without regard to conflict
                of law principles, except where local consumer protection law
                grants you rights that cannot be waived.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                11. Contact
              </h2>
              <p>
                Questions about these terms:{' '}
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
