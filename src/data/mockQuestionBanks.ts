export interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MockTest {
  id: string;
  exam: 'NDA' | 'CDS' | 'AFCAT';
  name: string;
  meta: string;
  durationSec: number;
  questions: McqQuestion[];
}

export const MOCK_TESTS: MockTest[] = [
  {
    id: 'nda-sectional-trig',
    exam: 'NDA',
    name: 'Sectional — Trigonometry',
    meta: '20 min · 20 Q',
    durationSec: 5 * 60,
    questions: [
      { question: 'sin²θ + cos²θ = ?', options: ['0', '1', '2', 'tanθ'], correctIndex: 1 },
      { question: 'The value of sin 30° is:', options: ['1', '1/2', '√3/2', '0'], correctIndex: 1 },
      { question: 'tan θ is equal to:', options: ['sinθ/cosθ', 'cosθ/sinθ', 'sinθ·cosθ', '1/sinθ'], correctIndex: 0 },
      { question: 'The value of cos 0° is:', options: ['0', '1', '−1', 'undefined'], correctIndex: 1 },
      { question: '1 + tan²θ = ?', options: ['sec²θ', 'cosec²θ', 'sin²θ', 'cos²θ'], correctIndex: 0 },
    ],
  },
  {
    id: 'nda-full-maths',
    exam: 'NDA',
    name: 'Full-Length — Maths',
    meta: '120 min · 120 Q',
    durationSec: 6 * 60,
    questions: [
      { question: 'The roots of x² − 7x + 12 = 0 are:', options: ['3, 4', '2, 6', '1, 12', '−3, −4'], correctIndex: 0 },
      { question: 'The determinant of a 2×2 identity matrix is:', options: ['0', '1', '2', '−1'], correctIndex: 1 },
      { question: 'The derivative of x² is:', options: ['x', '2x', 'x²', '2'], correctIndex: 1 },
      { question: 'The sum of the first 10 natural numbers is:', options: ['45', '50', '55', '60'], correctIndex: 2 },
      { question: 'log₁₀ 100 = ?', options: ['1', '2', '10', '100'], correctIndex: 1 },
    ],
  },
  {
    id: 'nda-full-gat',
    exam: 'NDA',
    name: 'Full-Length — GAT',
    meta: '150 min · 150 Q',
    durationSec: 6 * 60,
    questions: [
      { question: 'Choose the correctly spelled word:', options: ['Occassion', 'Ocasion', 'Occasion', 'Occassion'], correctIndex: 2 },
      { question: 'The chemical symbol for Sodium is:', options: ['So', 'Na', 'S', 'Sd'], correctIndex: 1 },
      { question: 'The capital of Australia is:', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctIndex: 2 },
      { question: 'Who wrote the Indian National Anthem?', options: ['Bankim Chandra', 'Rabindranath Tagore', 'Sarojini Naidu', 'Iqbal'], correctIndex: 1 },
      { question: 'The synonym of "Abundant" is:', options: ['Scarce', 'Plentiful', 'Rare', 'Limited'], correctIndex: 1 },
    ],
  },
  {
    id: 'cds-full-english',
    exam: 'CDS',
    name: 'Full-Length — English',
    meta: '120 min · 100 Q',
    durationSec: 6 * 60,
    questions: [
      { question: 'Choose the antonym of "Ancient":', options: ['Old', 'Modern', 'Historic', 'Vintage'], correctIndex: 1 },
      { question: '"To break the ice" means:', options: ['To fight', 'To start a conversation', 'To end a friendship', 'To postpone'], correctIndex: 1 },
      { question: 'Fill in the blank: She ___ to the market yesterday.', options: ['go', 'goes', 'went', 'gone'], correctIndex: 2 },
    ],
  },
  {
    id: 'cds-full-gk',
    exam: 'CDS',
    name: 'Full-Length — GK',
    meta: '120 min · 100 Q',
    durationSec: 6 * 60,
    questions: [
      { question: 'The Battle of Plassey was fought in:', options: ['1757', '1857', '1947', '1770'], correctIndex: 0 },
      { question: 'Which river is known as the "Sorrow of Bihar"?', options: ['Ganga', 'Kosi', 'Yamuna', 'Son'], correctIndex: 1 },
      { question: 'INS Vikrant is a:', options: ['Submarine', 'Aircraft carrier', 'Destroyer', 'Frigate'], correctIndex: 1 },
    ],
  },
  {
    id: 'cds-full-maths',
    exam: 'CDS',
    name: 'Full-Length — Maths',
    meta: '120 min · 100 Q',
    durationSec: 6 * 60,
    questions: [
      { question: 'The HCF of 12 and 18 is:', options: ['2', '3', '6', '9'], correctIndex: 2 },
      { question: '25% of 200 is:', options: ['25', '50', '75', '100'], correctIndex: 1 },
      { question: 'The area of a circle of radius 7 is (use π=22/7):', options: ['154', '144', '164', '174'], correctIndex: 0 },
    ],
  },
  {
    id: 'afcat-full',
    exam: 'AFCAT',
    name: 'Full-Length AFCAT',
    meta: '120 min · 100 Q',
    durationSec: 6 * 60,
    questions: [
      { question: 'AFCAT stands for:', options: ['Air Force Common Admission Test', 'Air Force Cadet Assessment Test', 'Aviation Force Common Aptitude Test', 'None of these'], correctIndex: 0 },
      { question: 'Find the odd one out: Boat, Ship, Submarine, Aircraft', options: ['Boat', 'Ship', 'Submarine', 'Aircraft'], correctIndex: 3 },
      { question: 'If 5 workers finish a task in 12 days, 10 workers will finish it in:', options: ['6 days', '24 days', '12 days', '3 days'], correctIndex: 0 },
    ],
  },
];

export interface EktQuestionBank {
  branch: string;
  questions: McqQuestion[];
}

export const EKT_QUESTION_BANKS: Record<string, McqQuestion[]> = {
  Mechanical: [
    { question: 'The SI unit of thermal conductivity is:', options: ['W/m·K', 'J/kg', 'N/m²', 'W/m²'], correctIndex: 0 },
    { question: 'Which is a ductile material?', options: ['Cast iron', 'Mild steel', 'Glass', 'Ceramic'], correctIndex: 1 },
  ],
  'Computer Science': [
    { question: 'A stack follows which order?', options: ['FIFO', 'LIFO', 'Random', 'Priority'], correctIndex: 1 },
    { question: 'The time complexity of binary search is:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 1 },
  ],
  'Electrical & Electronics': [
    { question: 'Ohm\'s Law states V = ?', options: ['I/R', 'IR', 'I²R', 'R/I'], correctIndex: 1 },
    { question: 'A diode primarily allows current to flow:', options: ['In both directions', 'In one direction', 'Never', 'Only with AC'], correctIndex: 1 },
  ],
};
