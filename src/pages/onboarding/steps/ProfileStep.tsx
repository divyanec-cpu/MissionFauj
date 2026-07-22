import type { ReactNode } from 'react';
import type { CandidateProfile, EducationLevel, Gender, MaritalStatus, NccStatus, Stream } from '../../../types/profile';
import { PillButton } from '../../../components/ui/PillButton';

const GENDER_OPTIONS: Gender[] = ['Male', 'Female'];
const MARITAL_OPTIONS: MaritalStatus[] = ['Unmarried', 'Married'];
const EDU_OPTIONS: EducationLevel[] = [
  'Class 12 (appearing)',
  'Class 12 (pass)',
  'Graduate (final yr)',
  'Graduate (pass)',
  'Postgraduate',
];
const STREAM_OPTIONS: Stream[] = ['Science (PCM)', 'Science (Other)', 'Commerce', 'Arts'];
const NCC_OPTIONS: NccStatus[] = ['None', 'Army Wing (C Cert)', 'Navy Wing (C Cert)', 'Air Wing (C Cert)'];

interface ProfileStepProps {
  profile: CandidateProfile;
  onChange: (patch: Partial<CandidateProfile>) => void;
  onSubmit: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-[11px] tracking-wide text-muted uppercase">{label}</div>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

export function ProfileStep({ profile, onChange, onSubmit }: ProfileStepProps) {
  const showStream = profile.education.startsWith('Class 12');

  return (
    <div className="flex flex-col gap-7 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Step 02</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">Candidate Profile</h2>
      </div>

      <div className="bg-bg-panel-2 border border-eligible flex items-center gap-2.5 px-4 py-3">
        <div className="text-[13px] text-khaki">
          Age <span className="font-heading font-bold text-ink">{profile.age}</span>
        </div>
        <div className="border-eligible text-eligible border px-2.5 py-1 text-[11px] tracking-wide uppercase">
          ✓ Verified at sign-in
        </div>
      </div>

      <Field label="Gender">
        {GENDER_OPTIONS.map((opt) => (
          <PillButton key={opt} active={profile.gender === opt} onClick={() => onChange({ gender: opt })}>
            {opt}
          </PillButton>
        ))}
      </Field>

      <Field label="Marital Status">
        {MARITAL_OPTIONS.map((opt) => (
          <PillButton key={opt} active={profile.marital === opt} onClick={() => onChange({ marital: opt })}>
            {opt}
          </PillButton>
        ))}
      </Field>

      <Field label="Education Level">
        {EDU_OPTIONS.map((opt) => (
          <PillButton key={opt} active={profile.education === opt} onClick={() => onChange({ education: opt })}>
            {opt}
          </PillButton>
        ))}
      </Field>

      {showStream && (
        <Field label="12th Stream">
          {STREAM_OPTIONS.map((opt) => (
            <PillButton key={opt} active={profile.stream === opt} onClick={() => onChange({ stream: opt })}>
              {opt}
            </PillButton>
          ))}
        </Field>
      )}

      <Field label="NCC Cadet Status">
        {NCC_OPTIONS.map((opt) => (
          <PillButton key={opt} active={profile.ncc === opt} onClick={() => onChange({ ncc: opt })}>
            {opt}
          </PillButton>
        ))}
      </Field>

      <div className="mt-2.5 flex flex-wrap gap-3.5">
        <button
          type="button"
          onClick={onSubmit}
          className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Run Eligibility Scan →
        </button>
      </div>
    </div>
  );
}
