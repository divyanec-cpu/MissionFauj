import { FEATURE_LIST } from '../../data/pricingPlans';

export function FeaturesOverview({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex max-w-3xl flex-col gap-5.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Full Access</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          What MissionFauj Gives You
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {FEATURE_LIST.map((f) => (
          <div key={f.title} className="bg-bg-panel border border-border border-l-4 border-l-amber px-4.5 py-4">
            <div className="font-heading mb-1.5 text-[15px] font-bold uppercase">{f.title}</div>
            <div className="text-[13px] leading-relaxed text-muted">{f.body}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="font-heading self-start cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
      >
        Continue to Plans →
      </button>
    </div>
  );
}
