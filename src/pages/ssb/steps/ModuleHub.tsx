import { Link } from 'react-router-dom';
import { BONUS_MODULES, GTO_MODULES, PSYCH_MODULES, interviewModules } from '../../../data/ssbModules';
import { ModuleCard } from '../../../components/ModuleCard';
import type { SsbModule } from '../../../types/ssb';

interface ModuleHubProps {
  scheme: string;
  attempts: string;
  onStartModule: (module: SsbModule, accent: 'amber' | 'steel' | 'eligible') => void;
}

export function ModuleHub({ scheme, attempts, onStartModule }: ModuleHubProps) {
  return (
    <div className="flex flex-col gap-7 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Registered</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">Training Modules</h2>
        <p className="mt-2 text-sm text-muted">
          Entry: {scheme} · {attempts} — PIQ and interview modules are framed for this.
        </p>
      </div>

      <div>
        <div className="font-heading mb-3 text-[13px] font-bold tracking-wide text-khaki uppercase">Psychology</div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PSYCH_MODULES.map((m) => (
            <ModuleCard key={m.id} name={m.name} desc={m.desc} accent="amber" onStart={() => onStartModule(m, 'amber')} />
          ))}
        </div>
      </div>

      <div>
        <div className="font-heading mb-3 text-[13px] font-bold tracking-wide text-khaki uppercase">
          Group Testing
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {GTO_MODULES.map((m) => (
            <ModuleCard key={m.id} name={m.name} desc={m.desc} accent="steel" onStart={() => onStartModule(m, 'steel')} />
          ))}
        </div>
      </div>

      <div>
        <div className="font-heading mb-3 text-[13px] font-bold tracking-wide text-khaki uppercase">
          Interview &amp; Self-Assessment
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {interviewModules(scheme).map((m) => (
            <ModuleCard key={m.id} name={m.name} desc={m.desc} accent="eligible" onStart={() => onStartModule(m, 'eligible')} />
          ))}
        </div>
      </div>

      <div>
        <div className="font-heading mb-3 text-[13px] font-bold tracking-wide text-khaki uppercase">Free Bonus</div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {BONUS_MODULES.map((m) => (
            <ModuleCard
              key={m.id}
              name={m.name}
              desc={m.desc}
              accent="eligible"
              free
              onStart={() => onStartModule(m, 'eligible')}
            />
          ))}
        </div>
      </div>

      <div className="bg-bg-panel flex flex-wrap items-center justify-between gap-3.5 border border-border border-l-4 border-l-amber px-5 py-4.5">
        <div>
          <div className="font-heading text-[15px] font-bold tracking-wide uppercase">Want Direct Feedback?</div>
          <div className="mt-0.5 text-xs text-muted">Book time with a retired IO, GTO, Psychologist or Board President.</div>
        </div>
        <Link
          to="/expert-consultation"
          className="font-heading border-none bg-amber px-5 py-2.5 text-[13px] font-bold tracking-wide whitespace-nowrap text-[#1b1500] uppercase no-underline"
        >
          Book Expert Consultation →
        </Link>
      </div>

      <div className="border-t border-border pt-3.5 text-[11px] leading-relaxed text-muted">
        Every module ends in self-review against a rubric. No numeric scoring on psychology or interview content —
        process metrics and neutral pattern-surfacing only.
      </div>
    </div>
  );
}
