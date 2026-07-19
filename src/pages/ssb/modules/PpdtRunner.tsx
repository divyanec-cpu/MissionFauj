import { useState } from 'react';
import { PPDT_PROMPTS } from '../../../data/ppdtPrompts';
import { useCountdown } from '../../../lib/useCountdown';
import { ScenePlaceholder } from '../../../components/ssb/ScenePlaceholder';

type Phase = 'view' | 'story' | 'discussion';

export function PpdtRunner({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('view');
  const [story, setStory] = useState('');
  const [notes, setNotes] = useState('');
  const prompt = PPDT_PROMPTS[0];

  const viewTime = useCountdown(30, 'view', () => setPhase('story'), phase === 'view');
  const storyTime = useCountdown(4 * 60, 'story', () => setPhase('discussion'), phase === 'story');

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">Picture Perception &amp; Discussion Test</div>

      {phase === 'view' && (
        <>
          <div className="font-heading mb-5 text-sm font-bold tracking-wide text-amber uppercase">
            Study the scene — {viewTime}s
          </div>
          <ScenePlaceholder variant={3} caption={prompt.caption} />
        </>
      )}

      {phase === 'story' && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-heading text-sm font-bold tracking-wide text-amber uppercase">
              Write your perception
            </div>
            <div className="font-heading text-lg font-bold text-amber">
              {Math.floor(storyTime / 60)}:{String(storyTime % 60).padStart(2, '0')}
            </div>
          </div>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            autoFocus
            rows={9}
            placeholder="Number of characters, their mood/age/sex, and what they're doing…"
            className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
          />
        </>
      )}

      {phase === 'discussion' && (
        <>
          <div className="font-heading mb-4 text-sm font-bold tracking-wide text-amber uppercase">
            Discussion Notes
          </div>
          <p className="mb-3 text-[13px] text-muted">
            No group discussion partner here — text-only, self-facilitated. Note the points you'd raise and how
            you'd bring the group to a shared story.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            autoFocus
            rows={7}
            placeholder="Key points to raise, how to handle disagreement, the story you'd propose…"
            className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
          />
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
