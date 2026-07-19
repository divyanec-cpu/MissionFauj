import type { SchemeResult } from '../../../types/schemes';
import { SchemeCard } from '../../../components/SchemeCard';

interface ReportStepProps {
  results: SchemeResult[];
  summaryLine: string;
  onRetake: () => void;
  onContinue: () => void;
}

export function ReportStep({ results, summaryLine, onRetake, onContinue }: ReportStepProps) {
  const eligible = results.filter((r) => r.eligible);
  const notEligible = results.filter((r) => !r.eligible);

  return (
    <div className="flex flex-col gap-7.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Scan Complete</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          Your Eligibility Report
        </h2>
        <div className="mt-2 text-sm text-muted">{summaryLine}</div>
      </div>

      <div>
        <div className="mb-3.5 flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 bg-eligible" />
          <div className="font-heading text-sm font-bold tracking-wide uppercase">Eligible — {eligible.length}</div>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {eligible.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3.5 flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 bg-not-eligible" />
          <div className="font-heading text-sm font-bold tracking-wide text-muted uppercase">
            Not Eligible — {notEligible.length}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {notEligible.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-3.5">
        <button
          type="button"
          onClick={onRetake}
          className="font-heading cursor-pointer border border-border bg-transparent px-6.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase"
        >
          Retake Briefing
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Continue to Written-Exam Prep →
        </button>
      </div>

      <div className="border-t border-border pt-3.5 text-[11px] leading-relaxed text-muted">
        Illustrative criteria for design preview. Production eligibility rules are pulled live from admin-editable
        scheme tables per the current official notification.
      </div>
    </div>
  );
}
