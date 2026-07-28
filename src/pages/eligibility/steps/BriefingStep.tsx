interface BriefingStepProps {
  onBegin: () => void;
}

const STATS = [
  { value: '13', label: 'Entry Schemes Scanned' },
  { value: 'NDA·CDS·AFCAT', label: 'Written Prep Live' },
  { value: 'SSB', label: 'All-Scheme Ready' },
];

export function BriefingStep({ onBegin }: BriefingStepProps) {
  return (
    <div className="flex flex-col items-center gap-5.5 pt-6 text-center sm:pt-14 animate-rise-in">
      <div className="text-xs font-semibold tracking-[3px] text-amber uppercase">
        Briefing · 15 Entry Schemes Covered
      </div>
      <h1 className="font-heading max-w-2xl text-4xl leading-tight font-bold tracking-wide uppercase sm:text-5xl">
        Eligibility Briefing
      </h1>
      <p className="max-w-lg text-base leading-relaxed text-muted">
        Answer a few questions on age, education and status. We'll scan every officer-entry scheme — NDA, CDS,
        AFCAT, TES, TGC, SSC, NCC Special Entry, UES, JAG, ACC, TA — and show exactly where you stand.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3.5">
        {STATS.map((s) => (
          <div key={s.label} className="bg-bg-panel border border-border clip-panel px-4.5 py-2.5">
            <div className="font-heading text-xl font-bold text-khaki">{s.value}</div>
            <div className="text-[10px] tracking-wide text-muted uppercase">{s.label}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onBegin}
        className="font-heading clip-button mt-3.5 cursor-pointer border-none bg-amber px-8.5 py-4 text-[15px] font-bold tracking-wide text-[#1b1500] uppercase"
      >
        Begin Briefing →
      </button>
    </div>
  );
}
