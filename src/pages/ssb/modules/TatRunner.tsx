import { useState } from 'react';
import { TAT_PROMPTS } from '../../../data/tatPrompts';
import { useCountdown } from '../../../lib/useCountdown';
import { ScenePlaceholder } from '../../../components/ssb/ScenePlaceholder';

type Phase = 'view' | 'write';

export function TatRunner({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('view');
  const [text, setText] = useState('');

  const advance = () => {
    setText('');
    setPhase('view');
    if (index + 1 >= TAT_PROMPTS.length) onComplete();
    else setIndex((i) => i + 1);
  };

  const onViewExpire = () => setPhase('write');

  const viewTime = useCountdown(30, `${index}-view`, onViewExpire, phase === 'view');
  const writeTime = useCountdown(4 * 60, `${index}-write`, advance, phase === 'write');

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">
        Image {index + 1} of {TAT_PROMPTS.length}
      </div>

      {phase === 'view' ? (
        <>
          <div className="font-heading mb-5 text-sm font-bold tracking-wide text-amber uppercase">
            Study the scene — {viewTime}s
          </div>
          <ScenePlaceholder variant={index} caption={TAT_PROMPTS[index].caption} />
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-heading text-sm font-bold tracking-wide text-amber uppercase">Write your story</div>
            <div className="font-heading text-lg font-bold text-amber">
              {Math.floor(writeTime / 60)}:{String(writeTime % 60).padStart(2, '0')}
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            rows={10}
            placeholder="What led to this moment, what's happening, and how does it resolve?"
            className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
          />
          <button
            type="button"
            onClick={advance}
            className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            {index + 1 >= TAT_PROMPTS.length ? 'Finish' : 'Next Image →'}
          </button>
        </>
      )}
    </div>
  );
}
