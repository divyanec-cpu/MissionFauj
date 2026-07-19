export type ExpertCategory = 'IO' | 'GTO' | 'Psychologist' | 'Board President' | 'English & Confidence';

export interface Expert {
  role: string;
  category: ExpertCategory;
  accent: string;
  name: string;
  credentials: string;
  bio: string;
  price: string;
  bonus?: boolean;
}

const PLACEHOLDER = '— to be added —';

export const EXPERT_CATEGORIES: Array<'All' | ExpertCategory> = [
  'All',
  'IO',
  'GTO',
  'Psychologist',
  'Board President',
  'English & Confidence',
];

export const EXPERTS: Expert[] = [
  { role: 'Interviewing Officer', category: 'IO', accent: 'var(--color-amber)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER },
  { role: 'Group Testing Officer', category: 'GTO', accent: 'var(--color-steel)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER },
  { role: 'Psychologist', category: 'Psychologist', accent: 'var(--color-khaki)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER },
  { role: 'Board President', category: 'Board President', accent: 'var(--color-eligible)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER },
  { role: 'English & Confidence Coach', category: 'English & Confidence', accent: 'var(--color-eligible)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER, bonus: true },
];

export const CONSULTATION_SLOTS = ['Today, 6:00 PM', 'Tomorrow, 11:00 AM', 'Tomorrow, 6:00 PM', 'Sat, 10:00 AM'];
