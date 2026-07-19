const SECTIONS = [
  {
    title: 'Grammar Essentials',
    body: 'Focus on subject-verb agreement, tense consistency and articles — the three most common slip-ups under interview pressure. Speak in short, complete sentences rather than long ones that risk losing structure midway.',
  },
  {
    title: 'Vocabulary for the Interview Room',
    body: 'Build a working set of precise words for describing yourself: "methodical" over "organized," "resilient" over "strong." Precision reads as clarity of thought, not showing off.',
  },
  {
    title: 'Spoken-Confidence Drills',
    body: 'Practice thinking out loud for 60 seconds on a random everyday topic, without notes. Record yourself (on your own device, outside this app) and listen for filler words — "um," "like," "basically" — then redo it without them.',
  },
  {
    title: 'Body Language Checklist',
    body: 'Sit upright, hands visible and still, steady eye contact with whoever is speaking. None of this is scored here — it is yours to observe and adjust in a mirror or with a friend.',
  },
];

export function EnglishConfidenceBonus() {
  return (
    <div className="flex max-w-2xl flex-col gap-6 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Free Bonus</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase">English &amp; Confidence</h2>
        <p className="mt-2 text-sm text-muted">
          Grammar, vocabulary and spoken-confidence material for interview day — free regardless of subscription.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {SECTIONS.map((s) => (
          <div key={s.title} className="bg-bg-panel border border-border border-l-4 border-l-eligible p-5">
            <div className="font-heading mb-1.5 text-[15px] font-bold uppercase">{s.title}</div>
            <div className="text-[13px] leading-relaxed text-khaki">{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
