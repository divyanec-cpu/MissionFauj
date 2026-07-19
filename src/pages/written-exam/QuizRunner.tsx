import { useState } from 'react';
import type { McqQuestion } from '../../data/mockQuestionBanks';

interface QuizRunnerProps {
  title: string;
  questions: McqQuestion[];
  onExit: () => void;
}

export function QuizRunner({ title, questions, onExit }: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];

  const pick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (index === questions.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  if (done) {
    return (
      <div className="max-w-xl animate-rise-in">
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">{title} — Quiz Complete</div>
        <h2 className="font-heading mb-2 text-3xl font-bold tracking-wide uppercase">
          {score} / {questions.length}
        </h2>
        <p className="mb-6 text-sm text-muted">Bite-sized reinforcement — retake anytime from the hub.</p>
        <button
          type="button"
          onClick={onExit}
          className="font-heading cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Back to Hub →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl animate-rise-in">
      <div className="mb-4 text-xs text-muted">
        {title} Quiz — Question {index + 1} of {questions.length}
      </div>
      <div className="bg-bg-panel border border-border mb-5 p-5">
        <div className="mb-4 text-base font-semibold">{q.question}</div>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            let cls = 'border-border bg-bg-panel-2 text-ink';
            if (selected !== null) {
              if (i === q.correctIndex) cls = 'border-eligible bg-eligible text-[#0f130a]';
              else if (i === selected) cls = 'border-not-eligible bg-not-eligible text-white';
            }
            return (
              <button
                key={opt}
                type="button"
                onClick={() => pick(i)}
                className={`cursor-pointer border px-4 py-2.5 text-left text-[13px] ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      {selected !== null && (
        <button
          type="button"
          onClick={next}
          className="font-heading cursor-pointer border-none bg-amber px-7 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          {index === questions.length - 1 ? 'Finish' : 'Next →'}
        </button>
      )}
    </div>
  );
}
