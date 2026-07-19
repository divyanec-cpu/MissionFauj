import { SSB_ENTRY_SCHEMES } from '../../../data/entrySchemes';
import { PillButton } from '../../../components/ui/PillButton';

interface SchemeStepProps {
  scheme: string;
  onChange: (scheme: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SchemeStep({ scheme, onChange, onBack, onContinue }: SchemeStepProps) {
  return (
    <div className="flex flex-col gap-6.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Step 02</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          Which Entry Are You Boarding For?
        </h2>
        <p className="mt-2 text-sm text-muted">
          SSB content is identical either way — this only tunes PIQ and interview framing.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {SSB_ENTRY_SCHEMES.map((opt) => (
          <PillButton key={opt} active={scheme === opt} onClick={() => onChange(opt)}>
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
          Continue →
        </button>
      </div>
    </div>
  );
}
