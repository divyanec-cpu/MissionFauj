export interface PricingPlan {
  name: string;
  price: string;
  // Only populated for the 'ssb' scope — the numeric value ModulePaywall
  // needs for the 20% existing-member-discount calculation. 'written' scope
  // plans only ever display `price` as-is.
  priceValue?: number | null;
  period: string;
  highlighted?: boolean;
  badge?: string;
  perks: string[];
}

// Actual plans (both 'written' and 'ssb' scope) are admin-editable
// (server/src/routes/admin/pricingPlans.ts) and fetched at runtime via
// src/lib/contentApi.ts's fetchPricingPlans(scope).

export const FEATURE_LIST = [
  { title: 'Chapter Notes', body: 'Original, exam-focused notes for every NDA, CDS and AFCAT subject.' },
  { title: 'Mock Tests', body: 'Full-length and sectional mocks with real exam timing and negative marking.' },
  {
    title: 'Current Affairs Digest',
    body: 'Short, dated briefs written for officer-entry GK — not scraped news. Chat with AI Assist on any brief to go deeper on that topic or a related subject.',
  },
  {
    title: 'Quizzes',
    body: 'Bite-sized quizzes on current affairs and static GK, built to reinforce each digest brief and chapter.',
  },
  {
    title: 'SSB Practice, All Schemes',
    body: 'WAT, TAT, SRT and self-description practice for all 15 entry schemes.',
  },
  {
    title: 'OLQ Self-Assessment',
    body: 'Reflect against the 15 Officer-Like Qualities — self-review, not a score.',
  },
  { title: 'Daily Streak', body: 'A simple habit tracker to keep your prep consistent through the cycle.' },
  {
    title: 'AI Assist',
    body: 'AI-based feedback on your written mock performance — accuracy trends, weak chapters, time management. SSB practice stays self-review, never AI-scored.',
  },
];
