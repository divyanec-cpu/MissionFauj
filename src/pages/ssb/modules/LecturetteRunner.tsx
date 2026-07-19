import { useState } from 'react';
import { LECTURETTE_TOPICS } from '../../../data/lecturetteTopics';
import { useCountdown } from '../../../lib/useCountdown';

type Phase = 'prep' | 'deliver';

export function LecturetteRunner({ onComplete }: { onComplete: () => void }) {
  const [topic] = useState(() => LECTURETTE_TOPICS[Math.floor(Math.random() * LECTURETTE_TOPICS.length)]);
  const [phase, setPhase] = useState<Phase>('prep');
  const [notes, setNotes] = useState('');

  const prepTime = useCountdown(3 * 60, 'prep', () => setPhase('deliver'), phase === 'prep');
  const deliverTime = useCountdown(3 * 60, 'deliver', onComplete, phase === 'deliver');

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">Lecturette</div>
      <div className="font-heading mb-5 text-xl font-bold tracking-wide uppercase">{topic}</div>

      {phase === 'prep' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-heading text-sm font-bold tracking-wide text-amber uppercase">Prep Time</div>
            <div className="font-heading text-lg font-bold text-amber">
              {Math.floor(prepTime / 60)}:{String(prepTime % 60).padStart(2, '0')}
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            autoFocus
            rows={7}
            placeholder="Jot your opening line, 2-3 main points, and a closing thought…"
            className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
          />
          <button
            type="button"
            onClick={() => setPhase('deliver')}
            className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Start Delivery →
          </button>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-heading text-sm font-bold tracking-wide text-amber uppercase">
              Delivering — speak from your notes
            </div>
            <div className="font-heading text-lg font-bold text-amber">
              {Math.floor(deliverTime / 60)}:{String(deliverTime % 60).padStart(2, '0')}
            </div>
          </div>
          <div className="bg-bg-panel border border-border p-5 text-[13px] leading-relaxed text-muted">
            No recording — this is a self-timed rehearsal. Speak your lecturette aloud (or run through it silently)
            using the notes you wrote, then self-review your structure, pacing and confidence.
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Finish →
          </button>
        </>
      )}
    </div>
  );
}
