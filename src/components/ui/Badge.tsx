interface BadgeProps {
  label: string;
  tone?: 'amber' | 'eligible' | 'not-eligible' | 'steel';
}

const TONE_CLASSES: Record<NonNullable<BadgeProps['tone']>, string> = {
  amber: 'text-amber border-amber',
  eligible: 'text-eligible border-eligible',
  'not-eligible': 'text-not-eligible border-not-eligible',
  steel: 'text-steel border-steel',
};

export function Badge({ label, tone = 'amber' }: BadgeProps) {
  return (
    <div
      className={`border px-2 py-0.5 text-[10px] tracking-wide uppercase whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {label}
    </div>
  );
}
