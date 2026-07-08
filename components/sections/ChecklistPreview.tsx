import Button from '@/components/ui/Button'

const STAGES = [
  {
    num:     '01',
    title:   'Stop & Scan',
    time:    '60 seconds',
    body:    'Rule out medical emergencies before anything else. Temperature check. Breathing assessment. Six conditions that require emergency services, not a soothing protocol.',
    note:    'Never skip this stage. Most colic protocols start at Stage 2 and assume the baby is medically stable. This one does not.',
  },
  {
    num:     '02',
    title:   'Environment Reset',
    time:    '30–60 seconds',
    body:    'Brown noise at 60–65dB — minimum seven feet from the baby\'s head. Warm dim light. Not darkness — warm and dim. This is the acoustic and visual reset that must precede touch. Sound before touch, every time.',
    note:    'Brown noise only. White noise sits above womb frequency range. The distinction matters for a dysregulated nervous system.',
  },
  {
    num:     '03',
    title:   'Soothing Circuit',
    time:    '5 minutes minimum',
    body:    'The Tiger Hold: face-down across your forearm, belly on the muscle of your arm, head in your palm, legs either side of your elbow. Pulse at 60 BPM — one beat per second. Not rocking. Pulsing. Hold for minimum five minutes before assessing results.',
    note:    'The 60 BPM rhythm deactivates the Moro startle reflex simultaneously with moving trapped gas. Two systems addressed at once.',
  },
  {
    num:     '04',
    title:   'Gas Release Sequence',
    time:    '3–5 minutes',
    body:    'Bicycle legs. ILU massage in the correct direction (I, L, U — always clockwise from your perspective looking at the baby\'s belly). Football hold. Each technique has a specific mechanical reason for its inclusion and its sequence position.',
    note:    'ILU massage direction is the most common execution error. The direction matters because of peristaltic movement direction in the gut.',
  },
]

export default function ChecklistPreview() {
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <section
      className="py-16 md:py-24 bg-bg"
      aria-labelledby="checklist-heading"
    >
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-terra mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-terra" aria-hidden="true" />
            The free protocol
          </p>
          <h2
            id="checklist-heading"
            className="font-serif font-bold text-brown text-3xl md:text-4xl leading-snug mb-4"
          >
            The Midnight Emergency Checklist{' '}
            <span className="text-terra">(The Zion Protocol)</span>
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            A four-stage crisis triage built from the same evidence base as
            the Blueprint. Free. No email required on Gumroad — or complete
            the quiz to get a version personalised to your baby&apos;s colic type.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-0">
          {/* Vertical connector line */}
          <div
            className="absolute left-[19px] top-6 bottom-6 w-px bg-border2 hidden md:block"
            aria-hidden="true"
          />

          {STAGES.map(({ num, title, time, body, note }) => (
            <article
              key={num}
              className="relative flex gap-6 pb-8 last:pb-0"
            >
              {/* Number bubble */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-terra flex items-center justify-center z-10">
                <span className="font-mono text-[10px] text-white font-semibold tracking-wide">
                  {num}
                </span>
              </div>

              {/* Content */}
              <div className="bg-card border border-border2 rounded-card p-6 flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-serif font-semibold text-brown text-lg">
                    {title}
                  </h3>
                  <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra bg-terra/10 border border-terra/25 px-2 py-1 rounded">
                    {time}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed">{body}</p>

                <p className="font-mono text-[9px] tracking-[0.06em] text-muted2 leading-relaxed border-t border-border pt-3">
                  {note}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            href={gumroadChecklist}
            variant="primary"
            size="lg"
            external
          >
            Download the free checklist
          </Button>
          <p className="text-xs text-muted2 font-mono tracking-wide">
            No email required · instant download
          </p>
        </div>
      </div>
    </section>
  )
}
