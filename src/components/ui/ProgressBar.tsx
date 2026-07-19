interface ProgressBarProps {
  pct: number;
  color?: string;
  trackClassName?: string;
  height?: number;
}

export function ProgressBar({ pct, color = 'var(--color-amber)', trackClassName = '', height = 6 }: ProgressBarProps) {
  return (
    <div className={`bg-bg-panel-2 ${trackClassName}`} style={{ height }}>
      <div
        className="h-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );
}
