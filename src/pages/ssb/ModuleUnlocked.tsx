interface ModuleUnlockedProps {
  moduleName: string;
  moduleDesc: string;
  onEnter: () => void;
}

export function ModuleUnlocked({ moduleName, moduleDesc, onEnter }: ModuleUnlockedProps) {
  return (
    <div className="flex max-w-md flex-col gap-4.5 pt-4 animate-rise-in">
      <div className="flex h-11 w-11 items-center justify-center bg-eligible">
        <span className="font-heading text-xl font-bold text-[#0f130a]">✓</span>
      </div>
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">{moduleName}</div>
        <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">Module Unlocked</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">You're already subscribed — {moduleDesc}</p>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="font-heading clip-button self-start cursor-pointer border-none bg-amber px-7.5 py-4 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        Enter {moduleName} →
      </button>
    </div>
  );
}
