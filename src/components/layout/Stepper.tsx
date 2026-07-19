interface StepperProps {
  steps: string[];
  activeIndex: number;
}

export function Stepper({ steps, activeIndex }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const color = i < activeIndex ? 'text-eligible' : i === activeIndex ? 'text-amber' : 'text-steel';
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className={`font-heading text-xs font-bold tracking-wide ${color}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={`font-heading text-xs font-semibold uppercase tracking-wider ${color}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-5 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
