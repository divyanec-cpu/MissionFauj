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

export const DEFAULT_PROFILE: CandidateProfile = {
  age: 18.5,
  gender: 'Male',
  marital: 'Unmarried',
  education: 'Class 12 (appearing)',
  stream: 'Science (PCM)',
  ncc: 'None',
};
