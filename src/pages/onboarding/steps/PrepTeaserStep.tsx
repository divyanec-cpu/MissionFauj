import { Link } from 'react-router-dom';
import { ClipPanel } from '../../../components/ui/ClipPanel';

const PREP_EXAMS = [
  {
    name: 'NDA',
    subjects: 'Maths · GAT (English + GK)',
    note: 'School-leaver pattern — algebra, trig, physics/chem basics, current affairs.',
  },
  {
    name: 'CDS',
    subjects: 'English · GK · Elementary Maths',
    note: 'Graduate-level GK depth; OTA candidates skip the Maths paper.',
  },
  {
    name: 'AFCAT',
    subjects: 'Verbal · Numerical · Reasoning · GK · MilAv',
    note: 'Add EKT only if applying for a technical branch.',
  },
];

export function PrepTeaserStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-7.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Step 04</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">Written-Exam Prep</h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Based on your eligibility, start with one of these — MVP written prep covers NDA, CDS and AFCAT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PREP_EXAMS.map((ex) => (
          <ClipPanel key={ex.name} accent="amber" className="flex flex-col gap-2.5">
            <div className="font-heading text-xl font-bold tracking-wide uppercase">{ex.name}</div>
            <div className="text-xs tracking-wide text-muted uppercase">{ex.subjects}</div>
            <div className="text-[13px] leading-relaxed text-khaki">{ex.note}</div>
            <Link
              to="/written-exam-prep"
              className="font-heading mt-1.5 self-start border border-amber px-4.5 py-2.5 text-[13px] font-semibold tracking-wide text-amber uppercase no-underline"
            >
              Start {ex.name} Prep →
            </Link>
          </ClipPanel>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="font-heading self-start cursor-pointer border border-border bg-transparent px-6.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase"
      >
        ← Back to Briefing
      </button>
    </div>
  );
}
