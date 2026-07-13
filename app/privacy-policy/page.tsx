import type { Metadata } from 'next'
import MinimalNav from '@/components/layout/MinimalNav'
import Footer     from '@/components/layout/Footer'

export const metadata: Metadata = {
  title:  'Privacy Policy — Colic Protocol',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'July 1, 2026'

export default function PrivacyPolicyPage() {
  return (
    <>
      <MinimalNav />
      <main id="main-content" className="bg-paper py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-12">

          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-4">
            Legal
          </p>
          <h1 className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-2">
            Privacy Policy
          </h1>
          <p className="font-mono text-[10px] text-muted2 mb-10">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="flex flex-col gap-8 text-sm text-muted leading-relaxed">

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                1. Who we are
              </h2>
              <p>
                Colic Protocol (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates
                colicprotocol.baby. This policy explains what data we collect
                when you use this website, how we use it, who we share it
                with, and the choices you have. If you have questions, email{' '}
                <a href="mailto:hello@colicprotocol.baby" className="text-terra underline underline-offset-2">
                  hello@colicprotocol.baby
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                2. What we collect
              </h2>
              <p className="mb-3">
                <strong className="text-brown">Information you provide directly:</strong> when
                you take the colic type quiz, download the free checklist, or
                subscribe to our email list, we collect your email address
                and, optionally, your first name. When you take the quiz, we
                also collect your answers — baby&apos;s age range, feeding
                method, crying pattern, symptoms, and what you have already
                tried — to personalise the protocol you receive.
              </p>
              <p>
                <strong className="text-brown">Information collected automatically:</strong> we
                use Google Analytics (GA4) and Google Tag Manager to
                understand how visitors use this site — pages viewed, time
                on page, referring source, and general device/location
                information (country-level, not precise location). We do not
                use Meta Pixel or any Meta advertising technology on this
                website, and we do not intend to.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                3. How we use your data
              </h2>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>To send you the free checklist and the follow-up email sequence you signed up for.</li>
                <li>To personalise which protocol content you receive, based on your quiz answers.</li>
                <li>To understand which content and traffic sources are working, so we can improve the site.</li>
                <li>To respond if you email us directly.</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal data. We do not share your email
                address with advertisers.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                4. Third parties who process your data
              </h2>
              <div className="flex flex-col gap-3">
                <div className="bg-card border border-border2 rounded-card p-5">
                  <p className="font-mono text-[10px] tracking-wide uppercase text-terra mb-1">
                    MailerLite
                  </p>
                  <p className="text-xs">
                    Our email service provider. Stores your email, name, and
                    quiz segmentation data to send the automated sequence.{' '}
                    <a href="https://www.mailerlite.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-terra underline underline-offset-2">
                      MailerLite&apos;s privacy policy
                    </a>.
                  </p>
                </div>
                <div className="bg-card border border-border2 rounded-card p-5">
                  <p className="font-mono text-[10px] tracking-wide uppercase text-terra mb-1">
                    Gumroad
                  </p>
                  <p className="text-xs">
                    Processes purchases of the Calm Baby Blueprint and
                    delivers the free checklist download. Gumroad handles
                    payment information directly — we never see or store your
                    card details.{' '}
                    <a href="https://gumroad.com/privacy" target="_blank" rel="noopener noreferrer" className="text-terra underline underline-offset-2">
                      Gumroad&apos;s privacy policy
                    </a>.
                  </p>
                </div>
                <div className="bg-card border border-border2 rounded-card p-5">
                  <p className="font-mono text-[10px] tracking-wide uppercase text-terra mb-1">
                    Google Analytics &amp; Google Tag Manager
                  </p>
                  <p className="text-xs">
                    Aggregate, anonymised usage analytics.{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-terra underline underline-offset-2">
                      Google&apos;s privacy policy
                    </a>.
                  </p>
                </div>
                <div className="bg-card border border-border2 rounded-card p-5">
                  <p className="font-mono text-[10px] tracking-wide uppercase text-terra mb-1">
                    Vercel
                  </p>
                  <p className="text-xs">
                    Our hosting provider. Processes standard server logs
                    (IP address, request timestamps) for security and
                    performance purposes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                5. Your rights
              </h2>
              <p className="mb-3">
                Depending on where you live, you may have the right to
                access, correct, delete, or export your personal data, and to
                object to or restrict certain processing. This includes
                rights under the EU/UK GDPR and the California Consumer
                Privacy Act (CCPA).
              </p>
              <p>
                To exercise any of these rights, email{' '}
                <a href="mailto:hello@colicprotocol.baby" className="text-terra underline underline-offset-2">
                  hello@colicprotocol.baby
                </a>. You can also unsubscribe from emails at any time using
                the link at the bottom of every email we send.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                6. Data retention
              </h2>
              <p>
                We retain your email and quiz data for as long as you remain
                subscribed, or until you request deletion. Purchase records
                are retained by Gumroad per their retention policy, which may
                extend beyond your subscription to us for tax and accounting
                purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                7. Children&apos;s privacy
              </h2>
              <p>
                This website and its products are intended for parents and
                caregivers of infants. We do not knowingly collect personal
                data from children. Any data collected relates to the adult
                subscriber, not the infant.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                8. Changes to this policy
              </h2>
              <p>
                We may update this policy from time to time. The &ldquo;Last
                updated&rdquo; date at the top reflects the most recent
                revision. Continued use of the site after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-serif font-semibold text-brown text-lg mb-2">
                9. Contact
              </h2>
              <p>
                Questions about this policy or your data:{' '}
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
