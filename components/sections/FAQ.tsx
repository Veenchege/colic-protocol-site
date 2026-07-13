'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'My baby is formula-fed. Does this apply?',
    a: 'Yes, with one adjustment. The L. reuteri RCT (Savino et al. 2010) was conducted in breastfed infants — the protocol for formula-fed babies leads with paced feeding technique and the correct bottle position to reduce air intake. The Tiger Hold, brown noise protocol, and ILU massage apply identically regardless of feeding method. The Blueprint has a dedicated formula-feeding track in Chapter 3.',
  },
  {
    q: 'My pediatrician said to wait it out. Are they wrong?',
    a: '90% of colic cases do resolve by 12 weeks — your pediatrician is medically accurate. What a 7-minute appointment cannot cover is what a 2026 nationwide study found: untreated colic is associated with long-term gut-brain axis disruption. Waiting has a cost. The protocol compresses the timeline and addresses the root cause rather than the symptom.',
  },
  {
    q: 'Which probiotic should I actually buy?',
    a: 'L. reuteri DSM 17938, sold commercially as BioGaia Protectis. That is the exact strain tested in the Savino et al. Pediatrics 2010 RCT and confirmed by two independent 2020 systematic reviews. Not a generic probiotic — this strain specifically. Screenshot the name. The dosing protocol for breastfed versus formula-fed infants, and the timing window relative to feeds, is in the Blueprint.',
  },
  {
    q: "What's the difference between the checklist and the Blueprint?",
    a: 'The checklist manages a colic episode — it gives you the immediate crisis intervention for tonight. The Blueprint fixes the root cause so episodes stop starting. Specifically, the checklist does not include the diagnostic decision tree that identifies which of three systems is primary in your baby, the calibrated dosing protocol for L. reuteri, or the sequencing architecture for running all three systems simultaneously.',
  },
  {
    q: 'What is the refund policy?',
    a: 'The 72-Hour Guarantee. Parents who implement the full protocol typically see measurable reduction in crying duration within 72 hours. If you do not, email Vincent directly, full refund, no forms, no delay. You keep the Blueprint, the Bloom Baby Tracker app, the brown noise soundscape, and the Cry Decoder audio. The financial risk is zero.',
  },
  {
    q: 'My baby is 10 weeks old. Is it too late?',
    a: 'The colic peak is weeks 5 to 7, and 90% of cases resolve by 12 weeks. If you are at week 10, the episodes may already be decreasing on their own timeline. The protocol still compresses the remaining window and addresses the gut microbiome imbalance that may otherwise linger past the acute crying phase. Worth running regardless.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="py-16 md:py-24 bg-surface" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-6 md:px-12">

        <div className="mb-10">
          <p className="kicker mb-4">Common questions</p>
          <h2
            id="faq-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight"
          >
            The six questions every parent asks before downloading.
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-border2">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = openIndex === i
            return (
              <div key={q}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left py-6 flex items-start justify-between gap-4 group
                             focus-visible:outline-2 focus-visible:outline-terra focus-visible:outline-offset-2 rounded"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <span className="font-semibold text-brown text-[17px] md:text-lg leading-snug group-hover:text-terra transition-colors duration-150">
                    {q}
                  </span>
                  <span
                    className={['flex-shrink-0 w-5 h-5 text-terra transition-transform duration-200 mt-0.5', isOpen ? 'rotate-180' : ''].join(' ')}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} className="pb-6">
                    <p className="text-[15px] text-muted leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
