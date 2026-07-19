import { SSB_MODULE_PRICE } from '../../data/pricingPlans';

interface ModulePaywallProps {
  moduleName: string;
  moduleDesc: string;
  scheme: string;
  isExistingMember: boolean;
  onStartTrial: () => void;
}

export function ModulePaywall({ moduleName, moduleDesc, scheme, isExistingMember, onStartTrial }: ModulePaywallProps) {
  const shownPrice = isExistingMember ? Math.round(SSB_MODULE_PRICE * 0.8) : SSB_MODULE_PRICE;

  return (
    <div className="flex max-w-md flex-col gap-5 pt-4 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">{moduleName}</div>
        <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
          Unlock Full SSB Training
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{moduleDesc}</p>
      </div>

      {isExistingMember && (
        <div className="bg-bg-panel-2 border border-amber flex items-center gap-3 px-4.5 py-3.5">
          <div className="font-heading text-xs font-bold tracking-wide text-amber uppercase">Member Discount</div>
          <div className="text-[13px] text-khaki">
            You're already on MissionFauj — 20% off SSB Prep, applied automatically.
          </div>
        </div>
      )}

      <div className="bg-bg-panel border border-amber flex flex-col gap-2 p-5.5">
        <div className="font-heading text-lg font-bold uppercase">SSB Prep — {scheme}</div>
        <div className="flex items-baseline gap-2.5">
          {isExistingMember && <div className="text-[15px] text-muted line-through">₹{SSB_MODULE_PRICE}</div>}
          <div className="font-heading text-[28px] font-bold text-khaki">
            ₹{shownPrice}
            <span className="text-[13px] font-normal text-muted"> / month</span>
          </div>
        </div>
        <div className="text-xs text-muted">Full access to Psychology, Group Testing and Interview modules.</div>
      </div>

      <div className="flex flex-col items-start gap-2.5">
        <button
          type="button"
          onClick={onStartTrial}
          className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-4 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Start 7-Day Free Trial →
        </button>
        <div className="text-xs text-muted">No payment required today. Cancel anytime before day 7.</div>
      </div>
    </div>
  );
}
