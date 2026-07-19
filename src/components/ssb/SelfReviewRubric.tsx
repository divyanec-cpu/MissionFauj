import { useState } from 'react';

interface SelfReviewRubricProps {
  moduleName: string;
  tags: string[];
  onDone: () => void;
}

export function SelfReviewRubric({ moduleName, tags, onDone }: SelfReviewRubricProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [reflection, setReflection] = useState('');

  const toggle = (tag: string) => setChecked((prev) => ({ ...prev, [tag]: !prev[tag] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="flex max-w-xl flex-col gap-5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">{moduleName} — Complete</div>
        <div className="font-heading text-2xl font-bold tracking-wide uppercase">Self-Review</div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          This is your own reflection, not a score. Nothing here is graded or AI-verdicted — mark the qualities you
          think you demonstrated and note what you'd do differently.
        </p>
      </div>

      <div>
        <div className="mb-2.5 text-[11px] tracking-wide text-muted uppercase">
          Qualities to reflect on ({checkedCount}/{tags.length} self-checked)
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`font-heading cursor-pointer border px-3.5 py-2 text-xs font-semibold tracking-wide uppercase ${
                checked[tag] ? 'border-eligible bg-eligible text-[#0f130a]' : 'border-border bg-bg-panel text-khaki'
              }`}
            >
              {checked[tag] ? '✓ ' : ''}
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] tracking-wide text-muted uppercase">Your Reflection</div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What went well? What would you change next time?"
          rows={4}
          className="bg-bg-panel-2 border border-border w-full resize-none px-3.5 py-3 text-[13px] text-ink"
        />
      </div>

      <button
        type="button"
        onClick={onDone}
        className="font-heading clip-button self-start cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        Done — Back to Modules
      </button>
    </div>
  );
}
