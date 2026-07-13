import type { Metadata } from 'next'
import Header           from '@/components/layout/Header'
import Footer           from '@/components/layout/Footer'
import Hero             from '@/components/sections/Hero'
import Validation       from '@/components/sections/Validation'
import Enemy            from '@/components/sections/Enemy'
import ThreeSystem      from '@/components/sections/ThreeSystem'
import OriginStory      from '@/components/sections/OriginStory'
import ScienceCitations from '@/components/sections/ScienceCitations'
import ChecklistPreview from '@/components/sections/ChecklistPreview'
import Testimonials     from '@/components/sections/Testimonials'
import GuaranteeBlock   from '@/components/sections/GuaranteeBlock'
import BlueprintTease   from '@/components/sections/BlueprintTease'
import FAQ              from '@/components/sections/FAQ'
import FinalCTA         from '@/components/sections/FinalCTA'

/* ─── Page metadata ──────────────────────────────────────────── */
export const metadata: Metadata = {
  title:
    'Colic Protocol — Evidence-Based Infant Colic Management',
  description:
    'Your baby isn\'t crying for "no reason." A 2-minute symptom test identifies which of three root causes is driving your baby\'s colic and delivers the exact protocol to run tonight. Free. Built by an Epidemiologist. Based on Savino et al., Pediatrics 2010.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title:       'Colic Protocol — Evidence-Based Infant Colic Management',
    description:
      'A 2-minute symptom test and free 3AM Emergency Protocol. Built by an Epidemiologist. Based on peer-reviewed research across 16 years.',
    url:         '/',
    type:        'website',
  },
}

/* ─── Page component ─────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* Full site header — logo + two nav links + checklist CTA */}
      <Header />

      <main id="main-content">

        {/* 1. Hero — dark, pain hook headline + quiz primary CTA + checklist
            secondary CTA + integrated trust strip (merged, was a separate
            TrustBar component — no reason for a second dark band right
            under the first one). */}
        <Hero />

        {/* Flat seam — dark hero into light body. One clean transition,
            not a gradient blur. */}
        <div className="seam-down" aria-hidden="true" />

        {/* 2. Validation — new. "Does this sound familiar" moment that
            was previously missing entirely between the hero hook and
            the evidence sections. See Ideal Client Persona v2 psychographic
            profile and Framework 3's carousel structure, both of which put
            validation before mechanism. */}
        <Validation />

        {/* 3. Enemy — simethicone / gripe water / wait it out destroyed with citations */}
        <Enemy />

        {/* 4. Three-system model — GUT / NS / ACOUSTIC mechanism explanation */}
        <ThreeSystem />

        {/* 5. Origin story — Zion, 2AM, 48 hours, Epidemiologist goes back to literature */}
        <OriginStory />

        {/* 6. Science citations — 4 citation cards, journal-styled */}
        <ScienceCitations />

        {/* 7. Checklist preview — 4 stages with timeline and download CTA */}
        <ChecklistPreview />

        {/* 8. Testimonials — renders nothing until lib/testimonials.ts is populated */}
        <Testimonials />

        {/* 9. Guarantee block — caption-safe language, no sticker phrasing */}
        <div className="py-10 md:py-16 bg-warm">
          <div className="max-w-3xl mx-auto px-6 md:px-12">
            <GuaranteeBlock showCTA={false} />
          </div>
        </div>

        {/* 10. Blueprint tease — brief product pitch, links to /blueprint */}
        <BlueprintTease />

        {/* 11. FAQ — 6 questions, accordion, handles the real objections */}
        <FAQ />

        {/* 12. Final CTA — repeats hero dual CTA */}
        <FinalCTA />

      </main>

      {/* Footer — social handles, legal links, medical disclaimer */}
      <Footer />
    </>
  )
}
