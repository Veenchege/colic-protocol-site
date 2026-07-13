import Button from '@/components/ui/Button'

const COMPONENTS = [
  { label: 'Diagnostic Protocol', desc: 'Decision tree that identifies the primary root cause system before any intervention.' },
  { label: 'Gut Reset Protocol',  desc: 'L. reuteri DSM 17938 — exact strain, dosage for breastfed vs formula-fed, timing within feeding schedule.' },
  { label: 'Physical Techniques', desc: 'Tiger Hold with rhythm specifications. ILU gas massage. Vagus nerve stimulation sequence.' },
  { label: 'Acoustic Design',     desc: 'Frequency, volume, distance, and duration specifications for brown noise deployment.' },
]

const BONUSES = [
  { label: 'Bloom Baby Tracker App',       desc: 'One-tap logging at 3AM. Reveals trigger patterns within days. Runs on iOS and Android.' },
  { label: '60-Min Brown Noise Soundscape', desc: 'Calibrated to womb frequencies. Use tonight. Plays on any device.' },
  { label: 'Cry Decoder Masterclass',      desc: 'Audio training that distinguishes hunger, colic pain, and overtired in under five seconds.' },
]

export default function BlueprintTease() {
  return (
    <section className="py-16 md:py-24 bg-paper" aria-labelledby="blueprint-heading">
      <div className="max-w-5xl mx-auto px-6 md:px-12">

        <div className="mb-10 max-w-2xl">
          <p className="kicker mb-4">The full protocol</p>
          <h2
            id="blueprint-heading"
            className="font-sans font-bold text-brown text-[30px] md:text-[38px] leading-[1.15] tracking-tight mb-4"
          >
            The checklist manages the crisis.{' '}
            <span className="text-terra">The Blueprint fixes the root cause.</span>
          </h2>
          <p className="text-[17px] text-muted leading-relaxed">
            The Midnight Emergency Checklist gives you Stages 2 and 3. It does not give
            you the diagnostic decision tree, the calibrated dosing protocol, or the
            sequencing architecture that makes all three systems work simultaneously.
            That is the Blueprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <div className="bg-card border border-border2 rounded-card p-7">
            <p className="kicker mb-5" style={{ color: 'var(--color-muted2)' }}>Core protocol</p>
            <div className="flex flex-col gap-5">
              {COMPONENTS.map(({ label, desc }) => (
                <div key={label} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-terra mt-2 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-[15px] font-semibold text-brown mb-1">{label}</p>
                    <p className="text-sm text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-terra/6 border border-terra/25 rounded-card p-7">
            <p className="kicker mb-5">Included bonuses</p>
            <div className="flex flex-col gap-5">
              {BONUSES.map(({ label, desc }) => (
                <div key={label} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-terra mt-2 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-[15px] font-semibold text-brown mb-1">{label}</p>
                    <p className="text-sm text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-6 border-t border-terra/20">
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif font-bold text-4xl text-terra">$47</span>
                <span className="font-mono text-[11px] tracking-wide uppercase text-muted2">one time · no subscription</span>
              </div>
            </div>
          </div>
        </div>

        <Button href="/blueprint" variant="secondary" size="md">
          See the full Blueprint
        </Button>
      </div>
    </section>
  )
}
