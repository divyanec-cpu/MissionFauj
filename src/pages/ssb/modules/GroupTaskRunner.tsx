import { useState } from 'react';
import { GROUP_TASK_SCENARIOS } from '../../../data/groupTaskScenarios';
import { useCountdown } from '../../../lib/useCountdown';

export function GroupTaskRunner({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');

  const advance = () => {
    setValue('');
    if (index + 1 >= GROUP_TASK_SCENARIOS.length) onComplete();
    else setIndex((i) => i + 1);
  };

  const timeLeft = useCountdown(5 * 60, index, advance);
  const scenario = GROUP_TASK_SCENARIOS[index];

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">
        Scenario {index + 1} of {GROUP_TASK_SCENARIOS.length} — {scenario.type}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-heading text-lg font-bold tracking-wide uppercase">{scenario.title}</div>
        <div className="font-heading text-lg font-bold text-amber">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
      <p className="mb-3 text-[13px] text-muted">{scenario.brief}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        rows={8}
        placeholder="Note your plan, the sequence of actions, and each member's role…"
        className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
      />
      <button
        type="button"
        onClick={advance}
        className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        {index + 1 >= GROUP_TASK_SCENARIOS.length ? 'Finish' : 'Next Scenario →'}
      </button>
    </div>
  );
}
