import type { PricingPlan } from '../data/pricingPlans';

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={`bg-bg-panel relative flex flex-col gap-2.5 border p-5.5 ${plan.highlighted ? 'border-amber' : 'border-border'}`}
    >
      {plan.badge && (
        <div className="font-heading absolute -top-px -right-px bg-amber px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#1b1500] uppercase">
          {plan.badge}
        </div>
      )}
      <div className="font-heading text-[17px] font-bold uppercase">{plan.name}</div>
      <div className="font-heading text-3xl font-bold text-khaki">{plan.price}</div>
      <div className="text-xs text-muted">{plan.period}</div>
      <div className="my-1.5 h-px bg-border" />
      <div className="flex flex-col gap-1.5 text-[13px] text-khaki">
        {plan.perks.map((perk) => (
          <div key={perk}>✓ {perk}</div>
        ))}
      </div>
    </div>
  );
}
