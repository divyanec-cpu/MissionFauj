export const AFCAT_SUBJECTS = [
  { name: 'Verbal Ability', count: 25 },
  { name: 'Numerical Ability', count: 25 },
  { name: 'Reasoning & Military Aptitude', count: 25 },
  { name: 'General Awareness', count: 25 },
];

export const EKT_BRANCHES = ['Mechanical', 'Computer Science', 'Electrical & Electronics'] as const;
export type EktBranch = (typeof EKT_BRANCHES)[number];

export const EKT_TOPICS: Record<EktBranch, string[]> = {
  Mechanical: ['Thermodynamics & Heat Engines', 'Strength of Materials', 'Machine Design'],
  'Computer Science': ['Data Structures & Algorithms', 'Operating Systems', 'Computer Networks'],
  'Electrical & Electronics': ['Circuit Theory', 'Digital Electronics', 'Control Systems'],
};
