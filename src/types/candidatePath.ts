import type { WrittenExam } from './subscription';

export type CandidatePath = 'school' | 'graduate' | 'ssb-only';

// Single source of truth for what each path means — read by the onboarding
// path picker (card copy), Written Exam Prep (tab filtering), and Home (CTA
// emphasis), so the exam mapping never drifts between the three places.
export const CANDIDATE_PATH_INFO: Record<CandidatePath, { label: string; description: string; exams: WrittenExam[] }> = {
  school: {
    label: 'School Student',
    description: 'Targeting NDA — written exam prep plus full SSB training.',
    exams: ['NDA'],
  },
  graduate: {
    label: 'Graduate',
    description: 'Targeting CDS or AFCAT — written exam prep plus full SSB training.',
    exams: ['CDS', 'AFCAT'],
  },
  'ssb-only': {
    label: 'SSB Only',
    description: "Already done with your written exam — go straight to SSB prep.",
    exams: ['NDA', 'CDS', 'AFCAT'],
  },
};
