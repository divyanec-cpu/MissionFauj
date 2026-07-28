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

// Actual listings are admin-editable (server/src/routes/admin/experts.ts) and
// fetched at runtime via src/lib/contentApi.ts's fetchExperts() — this file
// now only keeps the shared types plus the fixed category filter list.
export const EXPERT_CATEGORIES: Array<'All' | ExpertCategory> = [
  'All',
  'IO',
  'GTO',
  'Psychologist',
  'Board President',
  'English & Confidence',
];

export const CONSULTATION_SLOTS = ['Today, 6:00 PM', 'Tomorrow, 11:00 AM', 'Tomorrow, 6:00 PM', 'Sat, 10:00 AM'];
