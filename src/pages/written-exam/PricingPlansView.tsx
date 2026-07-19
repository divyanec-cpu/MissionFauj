import { getWrittenPricingPlans } from '../../data/pricingPlans';
import { PricingCard } from '../../components/PricingCard';

interface PricingPlansViewProps {
  exam: string;
  onStartTrial: () => void;
}

export function PricingPlansView({ exam, onStartTrial }: PricingPlansViewProps) {
  const plans = getWrittenPricingPlans(exam);

  return (
    <div className="flex max-w-4xl flex-col gap-5.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">{exam} Track</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">Choose Your Plan</h2>
        <p className="mt-1.5 max-w-lg text-sm text-muted">
          Plans are scoped to {exam} — SSB pricing varies separately by entry scheme.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-col items-start gap-2.5">
        <button
          type="button"
          onClick={onStartTrial}
          className="font-heading cursor-pointer border-none bg-amber px-8 py-4 text-[15px] font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Start 7-Day Free Trial →
        </button>
        <div className="text-xs text-muted">No payment required today. Cancel anytime before day 7.</div>
      </div>
    </div>
  );
}
