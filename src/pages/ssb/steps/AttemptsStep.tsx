import { SSB_ATTEMPT_OPTIONS } from '../../../data/entrySchemes';
import { PillButton } from '../../../components/ui/PillButton';

interface AttemptsStepProps {
  attempts: string;
  onChange: (attempts: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function AttemptsStep({ attempts, onChange, onBack, onContinue }: AttemptsStepProps) {
  return (
    <div className="flex flex-col gap-6.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Step 03</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          How Many SSB Attempts So Far?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Repeat candidates get the same modules — no rehearsed answers here, just more reps.
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {SSB_ATTEMPT_OPTIONS.map((opt) => (
          <PillButton key={opt} active={attempts === opt} onClick={() => onChange(opt)}>
            {opt}
          </PillButton>
        ))}
      </div>
      <div className="mt-1.5 flex gap-3.5">
        <button
          type="button"
          onClick={onBack}
          className="font-heading cursor-pointer border border-border bg-transparent px-6.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Enter Training →
        </button>
      </div>
    </div>
  );
}
