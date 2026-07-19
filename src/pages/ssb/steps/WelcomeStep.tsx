export function WelcomeStep({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex max-w-xl flex-col gap-5 pt-6 sm:pt-14 animate-rise-in">
      <div className="text-xs font-semibold tracking-[3px] text-amber uppercase">
        Scheme-Agnostic · All 15 Entry Routes
      </div>
      <h1 className="font-heading text-4xl leading-tight font-bold tracking-wide uppercase sm:text-5xl">
        Register for SSB Training
      </h1>
      <p className="text-base leading-relaxed text-muted">
        Psychology, Group Testing and Interview practice — every exercise ends in self-review against a rubric,
        never a canned "correct answer." Tell us your entry type and attempt count so we can frame it right.
      </p>
      <button
        type="button"
        onClick={onBegin}
        className="font-heading clip-button mt-1.5 self-start cursor-pointer border-none bg-amber px-8 py-4 text-[15px] font-bold tracking-wide text-[#1b1500] uppercase"
      >
        Begin Registration →
      </button>
    </div>
  );
}
