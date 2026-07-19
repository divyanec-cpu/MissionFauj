import type { Expert } from '../data/experts';

export function ExpertCard({ expert, onBook }: { expert: Expert; onBook: () => void }) {
  return (
    <div
      className="bg-bg-panel clip-card flex flex-col gap-2 border border-border border-l-4 p-5"
      style={{ borderLeftColor: expert.accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] tracking-wide uppercase" style={{ color: expert.accent }}>
          {expert.role}
        </div>
        {expert.bonus && (
          <div className="border border-eligible px-1.75 py-0.5 text-[9px] tracking-wide text-eligible uppercase">
            Bonus
          </div>
        )}
      </div>
      <div className="font-heading text-lg font-bold">{expert.name}</div>
      <div className="text-xs text-muted">{expert.credentials}</div>
      <p className="my-1.5 text-[13px] leading-relaxed text-khaki">{expert.bio}</p>
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="font-heading text-[17px] font-bold text-khaki">{expert.price}</div>
        <button
          type="button"
          onClick={onBook}
          className="font-heading cursor-pointer border px-4 py-2 text-xs font-semibold tracking-wide uppercase"
          style={{ color: expert.accent, borderColor: expert.accent }}
        >
          Book Session →
        </button>
      </div>
    </div>
  );
}
