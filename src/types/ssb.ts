export type SsbModuleId =
  | 'TAT'
  | 'WAT'
  | 'SRT'
  | 'Self Description'
  | 'PPDT'
  | 'Lecturette'
  | 'Group Tasks'
  | 'PIQ & Interview Prep'
  | 'OLQ Self-Assessment'
  | 'English & Confidence'
  | 'AI Assistant';

export interface SsbModule {
  id: SsbModuleId;
  name: string;
  desc: string;
}
