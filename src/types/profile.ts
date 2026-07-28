export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Unmarried' | 'Married';
export type EducationLevel =
  | 'Class 12 (appearing)'
  | 'Class 12 (pass)'
  | 'Graduate (final yr)'
  | 'Graduate (pass)'
  | 'Postgraduate';
export type Stream = 'Science (PCM)' | 'Science (Other)' | 'Commerce' | 'Arts';
export type NccStatus = 'None' | 'Army Wing (C Cert)' | 'Navy Wing (C Cert)' | 'Air Wing (C Cert)';

export interface CandidateProfile {
  age: number;
  gender: Gender;
  marital: MaritalStatus;
  education: EducationLevel;
  stream: Stream;
  ncc: NccStatus;
}

// While the profile is being collected, every field but age (verified at
// sign-in) starts unset — nothing is pre-selected, so the candidate has to
// actively answer each question rather than unknowingly accept a default.
export interface ProfileDraft {
  age: number;
  gender: Gender | null;
  marital: MaritalStatus | null;
  education: EducationLevel | null;
  stream: Stream | null;
  ncc: NccStatus | null;
}

export function emptyProfileDraft(age: number): ProfileDraft {
  return { age, gender: null, marital: null, education: null, stream: null, ncc: null };
}

export function isProfileComplete(draft: ProfileDraft): draft is CandidateProfile {
  if (draft.gender === null || draft.marital === null || draft.education === null || draft.ncc === null) return false;
  if (draft.education.startsWith('Class 12') && draft.stream === null) return false;
  return true;
}
