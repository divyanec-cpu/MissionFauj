import { ClipPanel } from './ui/ClipPanel';
import { Badge } from './ui/Badge';

interface ModuleCardProps {
  name: string;
  desc: string;
  accent: 'amber' | 'steel' | 'eligible';
  free?: boolean;
  ctaLabel?: string;
  onStart: () => void;
}

const CTA_CLASSES: Record<ModuleCardProps['accent'], string> = {
  amber: 'border-amber text-amber',
  steel: 'border-steel text-khaki',
  eligible: 'bg-eligible text-[#0f130a] border-transparent',
};

export function ModuleCard({ name, desc, accent, free, ctaLabel = 'Start →', onStart }: ModuleCardProps) {
  return (
    <ClipPanel accent={free ? 'eligible' : accent} accentSide={free ? 'full' : 'left'} className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="font-heading text-[17px] font-bold uppercase">{name}</div>
        {free && <Badge label="Free" tone="eligible" />}
      </div>
      <div className="text-[12px] leading-relaxed text-muted">{desc}</div>
      <button
        type="button"
        onClick={onStart}
        className={`font-heading mt-1.5 cursor-pointer self-start border px-4 py-2 text-xs font-semibold tracking-wide uppercase ${CTA_CLASSES[accent]}`}
      >
        {ctaLabel}
      </button>
    </ClipPanel>
  );
}
