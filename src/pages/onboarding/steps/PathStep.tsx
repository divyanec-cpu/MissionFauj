import { CANDIDATE_PATH_INFO, type CandidatePath } from '../../../types/candidatePath';
import { ClipPanel } from '../../../components/ui/ClipPanel';

const ORDER: CandidatePath[] = ['school', 'graduate', 'ssb-only'];

interface PathStepProps {
  selected: CandidatePath | null;
  onSelect: (path: CandidatePath) => void;
  onContinue: () => void;
}

export function PathStep({ selected, onSelect, onContinue }: PathStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center sm:pt-14 animate-rise-in">
      <div className="text-xs font-semibold tracking-[3px] text-amber uppercase">Report For Duty</div>
      <h1 className="font-heading max-w-2xl text-4xl leading-tight font-bold tracking-wide uppercase sm:text-5xl">
        What Brings You Here?
      </h1>
      <p className="max-w-lg text-base leading-relaxed text-muted">
        Pick what fits you best — this decides which written-exam prep you see first. You can change it any time from
        your profile.
      </p>
      <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {ORDER.map((path) => {
          const info = CANDIDATE_PATH_INFO[path];
          const isSelected = selected === path;
          return (
            <ClipPanel
              key={path}
              accent={isSelected ? 'amber' : 'none'}
              accentSide="full"
              onClick={() => onSelect(path)}
              className="text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-heading text-lg font-bold tracking-wide uppercase">{info.label}</div>
                {isSelected && <span className="text-lg font-bold text-amber">✓</span>}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{info.description}</p>
            </ClipPanel>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!selected}
        onClick={onContinue}
        className="font-heading clip-button mt-3.5 cursor-pointer border-none bg-amber px-8.5 py-4 text-[15px] font-bold tracking-wide text-[#1b1500] uppercase disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue →
      </button>
    </div>
  );
}
