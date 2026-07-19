import { useEffect, useRef, useState } from 'react';
import type { MockTest } from '../../data/mockQuestionBanks';

interface MockTestRunnerProps {
  test: MockTest;
  onExit: () => void;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function MockTestRunner({ test, onExit }: MockTestRunnerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(test.durationSec);
  const [submitted, setSubmitted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (submitted) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setSubmitted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [submitted]);

  if (submitted) {
    const score = test.questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    return (
      <div className="max-w-2xl animate-rise-in">
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">{test.name} — Complete</div>
        <h2 className="font-heading mb-1.5 text-3xl font-bold tracking-wide uppercase">Results</h2>
        <div className="font-heading mb-5 text-2xl font-bold text-khaki">
          {score} / {test.questions.length} correct
        </div>
        <div className="flex flex-col gap-3">
          {test.questions.map((q, i) => {
            const yourAnswer = answers[i];
            const correct = yourAnswer === q.correctIndex;
            return (
              <div
                key={i}
                className={`bg-bg-panel border border-border border-l-4 p-4 ${correct ? 'border-l-eligible' : 'border-l-not-eligible'}`}
              >
                <div className="mb-1.5 text-sm font-semibold">{q.question}</div>
                <div className="text-[13px] text-muted">
                  Your answer: {yourAnswer !== undefined ? q.options[yourAnswer] : '— skipped —'}
                </div>
                {!correct && <div className="text-[13px] text-eligible">Correct answer: {q.options[q.correctIndex]}</div>}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onExit}
          className="font-heading mt-6 cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Back to Hub →
        </button>
      </div>
    );
  }

  const q = test.questions[index];

  return (
    <div className="max-w-2xl animate-rise-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-muted">
          Question {index + 1} of {test.questions.length}
        </div>
        <div className="font-heading text-lg font-bold text-amber">{formatTime(timeLeft)}</div>
      </div>

      <div className="bg-bg-panel border border-border mb-5 p-5">
        <div className="mb-4 text-base font-semibold">{q.question}</div>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [index]: i }))}
              className={`cursor-pointer border px-4 py-2.5 text-left text-[13px] ${
                answers[index] === i ? 'border-amber bg-amber text-[#1b1500]' : 'border-border bg-bg-panel-2 text-ink'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3.5">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="font-heading cursor-pointer border border-border bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-muted uppercase disabled:opacity-40"
        >
          ← Prev
        </button>
        {index < test.questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(test.questions.length - 1, i + 1))}
            className="font-heading cursor-pointer border-none bg-amber px-7 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="font-heading cursor-pointer border-none bg-amber px-7 py-3 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
