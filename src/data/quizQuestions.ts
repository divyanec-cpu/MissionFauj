import type { McqQuestion } from './mockQuestionBanks';

export const QUIZ_QUESTIONS: Record<'NDA' | 'CDS' | 'AFCAT', McqQuestion[]> = {
  NDA: [
    { question: 'The discriminant of a quadratic ax² + bx + c is:', options: ['b² − 4ac', 'b² + 4ac', '4ac − b²', 'a² − 4bc'], correctIndex: 0 },
    { question: 'The chemical formula of water is:', options: ['H2O', 'HO2', 'H2O2', 'HO'], correctIndex: 0 },
    { question: 'Who was India\'s first Prime Minister?', options: ['Sardar Patel', 'Jawaharlal Nehru', 'Rajendra Prasad', 'B.R. Ambedkar'], correctIndex: 1 },
    { question: 'The value of π (approx.) is:', options: ['3.14', '2.71', '1.62', '4.13'], correctIndex: 0 },
    { question: 'A right angle measures:', options: ['45°', '90°', '180°', '360°'], correctIndex: 1 },
  ],
  CDS: [
    { question: 'The Indian Constitution was adopted in:', options: ['1947', '1950', '1949', '1952'], correctIndex: 2 },
    { question: '"Kautilya" is another name for:', options: ['Ashoka', 'Chanakya', 'Akbar', 'Bindusara'], correctIndex: 1 },
    { question: 'The synonym of "Candid" is:', options: ['Frank', 'Shy', 'Rude', 'Vague'], correctIndex: 0 },
    { question: 'Which is the largest state in India by area?', options: ['Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Uttar Pradesh'], correctIndex: 2 },
    { question: 'CDS full form is:', options: ['Combined Defence Services', 'Central Defence Service', 'Combined Defence Selection', 'Cadet Defence Services'], correctIndex: 0 },
  ],
  AFCAT: [
    { question: 'The first Indian Air Force day is celebrated on:', options: ['8 October', '15 August', '26 January', '1 April'], correctIndex: 0 },
    { question: 'Complete the series: 2, 4, 8, 16, ?', options: ['24', '32', '20', '18'], correctIndex: 1 },
    { question: 'The IAF aircraft "Tejas" is a:', options: ['Transport aircraft', 'Light Combat Aircraft', 'Helicopter', 'Trainer only'], correctIndex: 1 },
    { question: 'A pilot\'s "Mayday" call signals:', options: ['Routine check', 'Life-threatening emergency', 'Weather update', 'Landing clearance'], correctIndex: 1 },
    { question: 'EKT stands for:', options: ['Engineering Knowledge Test', 'Elementary Knowledge Test', 'Engineering Key Test', 'Exam Knowledge Test'], correctIndex: 0 },
  ],
};
