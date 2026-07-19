import { useState } from 'react';
import { WAT_WORDS } from '../../../data/watWords';
import { useCountdown } from '../../../lib/useCountdown';

export function WatRunner({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');

  const advance = () => {
    setValue('');
    if (index + 1 >= WAT_WORDS.length) onComplete();
    else setIndex((i) => i + 1);
  };

  const timeLeft = useCountdown(15, index, advance);

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">
        Word {index + 1} of {WAT_WORDS.length}
      </div>
      <div className="font-heading mb-6 text-sm font-bold tracking-wide text-amber uppercase">
        No backspace or editing — your response locks in when the timer ends.
      </div>
      <div className="bg-bg-panel border border-border mb-5 flex flex-col items-center gap-4 p-8 text-center">
        <div className="font-heading text-4xl font-bold text-khaki">{WAT_WORDS[index]}</div>
        <div className="font-heading text-2xl font-bold text-amber">{timeLeft}s</div>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' || e.key === 'Delete') e.preventDefault();
        }}
        onPaste={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        autoFocus
        placeholder="Write the first response that comes to mind…"
        className="bg-bg-panel-2 border border-border w-full px-4 py-3 text-sm text-ink"
      />
    </div>
  );
}
