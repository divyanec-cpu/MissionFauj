import { useState } from 'react';
import { PIQ_INTERVIEW_QUESTIONS } from '../../../data/interviewQuestions';
import { useCountdown } from '../../../lib/useCountdown';

export function PiqInterviewRunner({ scheme, onComplete }: { scheme: string; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');

  const advance = () => {
    setValue('');
    if (index + 1 >= PIQ_INTERVIEW_QUESTIONS.length) onComplete();
    else setIndex((i) => i + 1);
  };

  const timeLeft = useCountdown(3 * 60, index, advance);

  return (
    <div className="max-w-lg animate-rise-in">
      <div className="mb-1.5 text-xs text-muted">
        {scheme} PIQ &amp; Interview — Question {index + 1} of {PIQ_INTERVIEW_QUESTIONS.length}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-heading text-lg font-bold tracking-wide uppercase">{PIQ_INTERVIEW_QUESTIONS[index]}</div>
        <div className="font-heading shrink-0 pl-3 text-lg font-bold text-amber">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        rows={8}
        placeholder="Answer as you would across the table — self-review afterward, no AI scoring."
        className="bg-bg-panel-2 border border-border w-full resize-none px-4 py-3 text-sm text-ink"
      />
      <button
        type="button"
        onClick={advance}
        className="font-heading mt-4 cursor-pointer border-none bg-amber px-6 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        {index + 1 >= PIQ_INTERVIEW_QUESTIONS.length ? 'Finish' : 'Next →'}
      </button>
    </div>
  );
}
