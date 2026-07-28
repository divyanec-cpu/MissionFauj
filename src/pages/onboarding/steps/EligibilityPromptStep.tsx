interface EligibilityPromptStepProps {
  onTakeTest: () => void;
  onSkip: () => void;
}

export function EligibilityPromptStep({ onTakeTest, onSkip }: EligibilityPromptStepProps) {
  return (
    <div className="flex flex-col items-center gap-5.5 pt-6 text-center sm:pt-14 animate-rise-in">
      <div className="text-xs font-semibold tracking-[3px] text-amber uppercase">One More Thing — Optional</div>
      <h1 className="font-heading max-w-2xl text-4xl leading-tight font-bold tracking-wide uppercase sm:text-5xl">
        Check Your Eligibility?
      </h1>
      <p className="max-w-lg text-base leading-relaxed text-muted">
        See exactly which entry schemes you qualify for based on age, education and status — takes about 2 minutes.
        Or skip it for now; it's always available from the header whenever you want it.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3.5">
        <button
          type="button"
          onClick={onTakeTest}
          className="font-heading clip-button cursor-pointer border-none bg-amber px-8.5 py-4 text-[15px] font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Take the Test →
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="font-heading cursor-pointer border border-border bg-transparent px-8.5 py-4 text-[15px] font-semibold tracking-wide text-muted uppercase"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}
