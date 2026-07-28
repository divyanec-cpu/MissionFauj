import { EXAM_TIMELINES } from '../data/examTimelines';

interface ExamProcessTimelineProps {
  exam: 'NDA' | 'CDS' | 'AFCAT';
}

export function ExamProcessTimeline({ exam }: ExamProcessTimelineProps) {
  const stages = EXAM_TIMELINES[exam];

  return (
    <div>
      <div className="border-border bg-bg-panel-2 mb-6 border px-4 py-3 text-[12px] leading-relaxed text-muted">
        Typical cycle for {exam} — exact notification and exam dates shift slightly every year. Always confirm the
        current dates on the official UPSC (upsc.gov.in) or Indian Air Force (afcat.cdac.in) website before applying.
      </div>
      <div className="flex flex-col">
        {stages.map((s, i) => (
          <div key={s.stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="font-heading bg-amber flex h-8 w-8 flex-none items-center justify-center text-xs font-bold text-[#1b1500]">
                {i + 1}
              </div>
              {i < stages.length - 1 && <div className="bg-border w-px flex-1" />}
            </div>
            <div className={`flex flex-col gap-1 ${i < stages.length - 1 ? 'pb-6' : ''}`}>
              <div className="font-heading text-sm font-bold tracking-wide uppercase">{s.stage}</div>
              <div className="text-amber text-[11px] tracking-wide uppercase">{s.timing}</div>
              <div className="text-khaki max-w-lg text-[13px] leading-relaxed">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
