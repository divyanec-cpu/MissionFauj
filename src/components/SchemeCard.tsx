import type { SchemeResult } from '../types/schemes';
import { ClipPanel } from './ui/ClipPanel';
import { Badge } from './ui/Badge';

export function SchemeCard({ scheme }: { scheme: SchemeResult }) {
  if (scheme.eligible) {
    return (
      <ClipPanel accent="eligible" clip="card">
        <div className="flex items-start justify-between gap-2">
          <div className="font-heading text-base font-bold tracking-wide">{scheme.name}</div>
          <Badge label="Eligible" tone="eligible" />
        </div>
        <div className="mt-0.5 text-[11px] tracking-wide text-muted uppercase">{scheme.branch}</div>
        <div className="mt-2.5 text-[13px] leading-relaxed text-khaki">{scheme.reason}</div>
      </ClipPanel>
    );
  }

  return (
    <div className="bg-bg-panel-2 border border-border p-5 opacity-70">
      <div className="flex items-start justify-between gap-2">
        <div className="font-heading text-[15px] font-semibold text-steel">{scheme.name}</div>
        <Badge label="Not Yet" tone="not-eligible" />
      </div>
      <div className="mt-0.5 text-[11px] tracking-wide text-muted uppercase">{scheme.branch}</div>
      <div className="mt-2.5 text-[13px] leading-relaxed text-muted">{scheme.reason}</div>
    </div>
  );
}
