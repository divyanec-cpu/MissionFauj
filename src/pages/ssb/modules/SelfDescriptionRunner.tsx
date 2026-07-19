import { useState } from 'react';
import { SELF_DESCRIPTION_PROMPTS } from '../../../data/selfDescriptionPrompts';
import { useCountdown } from '../../../lib/useCountdown';

export function SelfDescriptionRunner({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');

  const advance = () => {
    setValue('');
    if (index + 1 >= SELF_DESCRIPTION_PROMPTS.length) onComplete();
    else setIndex((i) => i + 1);
  };

  const timeLeft = useCountdown(3 * 60, index, advance);
  const item = SELF_DESCRIPTION_PROMPTS[index];

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">
        Perspective {index + 1} of {SELF_DESCRIPTION_PROMPTS.length}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-heading text-sm font-bold tracking-wide text-amber uppercase">{item.perspective}</div>
        <div className="font-heading text-lg font-bold text-amber">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
      <p className="mb-3 text-[13px] text-muted">{item.prompt}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        rows={8}
        placeholder="Write freely — this section is timed."
        className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
      />
      <button
        type="button"
        onClick={advance}
        className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        {index + 1 >= SELF_DESCRIPTION_PROMPTS.length ? 'Finish' : 'Next →'}
      </button>
    </div>
  );
}
