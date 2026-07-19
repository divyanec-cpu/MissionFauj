export interface EligibilityRow {
  name: string;
  age: string;
  education: string;
  marital: string;
}

export const ELIGIBILITY_ROWS: EligibilityRow[] = [
  {
    name: 'National Defence Academy — Army, Navy & Air Force Wings',
    age: '16.5–19.5 years',
    education: 'Class 12 pass or appearing (Navy & Air Force wings also need Physics, Chemistry & Mathematics)',
    marital: 'Unmarried',
  },
  {
    name: 'Naval Academy — 10+2 Cadet Entry (Bachelor of Technology)',
    age: '16.5–19.5 years',
    education: 'Class 12 with Physics, Chemistry & Mathematics',
    marital: 'Unmarried',
  },
  {
    name: 'Combined Defence Services — Indian Military Academy / Indian Naval Academy',
    age: '19–24 years',
    education: 'Graduate degree',
    marital: 'Unmarried',
  },
  {
    name: 'Combined Defence Services — Air Force Academy',
    age: '19–24 years',
    education: 'Graduate degree with Physics, Chemistry & Mathematics, or Bachelor of Engineering',
    marital: 'Unmarried',
  },
  {
    name: 'Combined Defence Services — Officers Training Academy',
    age: '19–25 years',
    education: 'Graduate degree',
    marital: 'Unmarried, or a widow/divorcee without children',
  },
  {
    name: 'Air Force Common Admission Test — Flying Branch',
    age: '20–24 years',
    education: 'Graduate degree with Class 12 Physics, Chemistry & Mathematics',
    marital: 'No restriction stated',
  },
  {
    name: 'Air Force Common Admission Test — Ground Duty Branches',
    age: '20–26 years',
    education: 'Graduate degree, or Bachelor of Engineering / Technology',
    marital: 'No restriction stated',
  },
  {
    name: 'Technical Entry Scheme',
    age: '16.5–19.5 years',
    education: 'Class 12 with Physics, Chemistry & Mathematics, 70% or above',
    marital: 'Unmarried',
  },
  {
    name: 'National Cadet Corps Special Entry',
    age: '19–24 years',
    education: 'Graduate degree with a Senior Division NCC "C" Certificate',
    marital: 'Unmarried',
  },
  {
    name: 'Territorial Army',
    age: '18–42 years',
    education: 'Graduate degree, with civilian employment',
    marital: 'No restriction stated',
  },
];

export interface SsbDay {
  day: string;
  title: string;
  desc: string;
}

export const SSB_DAYS: SsbDay[] = [
  {
    day: 'Day 1',
    title: 'Screening',
    desc: 'Officer Intelligence Rating tests, then the Picture Perception & Discussion Test — a 30-second picture view, followed by individual narration and group discussion. Only candidates who clear screening continue.',
  },
  {
    day: 'Day 2',
    title: 'Psychology',
    desc: 'The Thematic Apperception Test, Word Association Test, Situation Reaction Test and Self Description exercise, back to back, all timed and written only — no group discussion this day.',
  },
  {
    day: 'Day 3',
    title: 'Group Testing Officer Tasks, Part 1',
    desc: 'Group Discussion, Group Planning Exercise, Progressive Group Task and the Group Obstacle Race.',
  },
  {
    day: 'Day 4',
    title: 'Group Testing Officer Tasks, Part 2',
    desc: 'Half Group Task, Lecturette (a short talk on a given topic), Individual Obstacles, Command Task and the Final Group Task.',
  },
  {
    day: 'Day 5',
    title: 'Conference',
    desc: 'A short individual conversation with the full board, followed by results the same day.',
  },
];
