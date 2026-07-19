import { useState } from 'react';
import { SRT_SITUATIONS } from '../../../data/srtSituations';
import { useCountdown } from '../../../lib/useCountdown';

export function SrtRunner({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');

  const advance = () => {
    setValue('');
    if (index + 1 >= SRT_SITUATIONS.length) onComplete();
    else setIndex((i) => i + 1);
  };

  const timeLeft = useCountdown(30, index, advance);

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">
        Situation {index + 1} of {SRT_SITUATIONS.length}
      </div>
      <div className="bg-bg-panel border border-border mb-5 flex flex-col gap-3 p-6">
        <div className="text-[15px] leading-relaxed text-khaki">{SRT_SITUATIONS[index]}</div>
        <div className="font-heading self-end text-lg font-bold text-amber">{timeLeft}s</div>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        placeholder="Your immediate reaction, in one line…"
        className="bg-bg-panel-2 border border-border w-full px-4 py-3 text-sm text-ink"
      />
      <button
        type="button"
        onClick={advance}
        className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        {index + 1 >= SRT_SITUATIONS.length ? 'Finish' : 'Next →'}
      </button>
    </div>
  );
}
