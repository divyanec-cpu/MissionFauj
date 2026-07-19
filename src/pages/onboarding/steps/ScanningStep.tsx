import { ProgressBar } from '../../../components/ui/ProgressBar';

interface ScanningStepProps {
  scanProgress: number;
  schemeNames: string[];
}

export function ScanningStep({ scanProgress, schemeNames }: ScanningStepProps) {
  return (
    <div className="flex flex-col items-center gap-6.5 pt-6 text-center sm:pt-14 animate-rise-in">
      <div className="font-heading animate-scan-pulse text-2xl font-bold tracking-wide uppercase sm:text-3xl">
        Scanning Eligibility…
      </div>
      <div className="border border-border w-full max-w-md">
        <ProgressBar pct={scanProgress} />
      </div>
      <div className="flex w-full max-w-md flex-col gap-2 text-left">
        {schemeNames.map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-2.5 text-[13px] text-muted animate-check-in"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <span className="font-heading font-bold text-eligible">✓</span>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
