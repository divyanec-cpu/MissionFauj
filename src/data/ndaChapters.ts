export interface Chapter {
  name: string;
  pct: number;
}

export interface Subject {
  name: string;
  chapters: Chapter[];
}

export const NDA_MATHS_CHAPTERS: Chapter[] = [
  { name: 'Algebra', pct: 80 },
  { name: 'Matrices & Determinants', pct: 60 },
  { name: 'Trigonometry', pct: 45 },
  { name: 'Quadratic Equations', pct: 30 },
  { name: 'Analytical Geometry', pct: 10 },
  { name: 'Differential Calculus', pct: 0 },
  { name: 'Integral Calculus', pct: 0 },
  { name: 'Vector Algebra & Statistics', pct: 0 },
];

export const NDA_GAT_CHAPTERS: Chapter[] = [
  { name: 'English — Grammar & Usage', pct: 70 },
  { name: 'English — Comprehension', pct: 55 },
  { name: 'GK — Physics & Chemistry', pct: 40 },
  { name: 'GK — History & Geography', pct: 20 },
  { name: 'GK — Current Events', pct: 15 },
];

export const NDA_SUBJECTS: Subject[] = [
  { name: 'Mathematics', chapters: NDA_MATHS_CHAPTERS },
  { name: 'GAT — English & GK', chapters: NDA_GAT_CHAPTERS },
];

export interface ChapterContent {
  definition: string;
  natureOfRoots: string;
  formulas: string[];
  solvedExample: string;
}

/** Only "Quadratic Equations" has full authored content in this build; every
 * other chapter falls back to this same detail shape via a generic note. */
export const QUADRATIC_EQUATIONS_CONTENT: ChapterContent = {
  definition:
    'A quadratic equation is a second-degree polynomial equation in one variable, written as ax² + bx + c = 0, where a ≠ 0. The highest power of the variable is 2, which gives the equation its characteristic parabolic graph when plotted.',
  natureOfRoots:
    'The discriminant D = b² − 4ac tells you what kind of roots the equation has: real and distinct if D > 0, real and equal if D = 0, and complex conjugates if D < 0. NDA papers frequently test this without asking you to solve the full equation.',
  formulas: ['Roots: x = (−b ± √D) / 2a', 'Sum of roots: α + β = −b/a', 'Product of roots: αβ = c/a'],
  solvedExample:
    'Solve x² − 5x + 6 = 0. Here D = 25 − 24 = 1, so the roots are real and distinct: x = (5 ± 1)/2, giving x = 3 or x = 2. Check: 3 + 2 = 5 = −b/a and 3 × 2 = 6 = c/a — both match, confirming the roots.',
};
