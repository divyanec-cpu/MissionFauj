export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  highlighted?: boolean;
  badge?: string;
  perks: string[];
}

export function getWrittenPricingPlans(examName: string): PricingPlan[] {
  return [
    {
      name: 'Monthly',
      price: '₹499',
      period: 'per month',
      perks: [`${examName} written prep`, 'Full-length & sectional mocks', 'Current-affairs digest'],
    },
    {
      name: 'Quarterly',
      price: '₹1,199',
      period: 'per quarter · ₹400/mo',
      highlighted: true,
      badge: 'Most Popular',
      perks: ['Everything in Monthly', 'SSB practice, all schemes', 'OLQ self-assessment'],
    },
    {
      name: 'Till Exam Day',
      price: '₹1,999',
      period: 'one-time, valid till result',
      perks: ['Everything in Quarterly', 'Locked-in access through your exam cycle'],
    },
  ];
}

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

export const SSB_BASE_PRICES: Record<string, number> = { NDA: 799, CDS: 899, AFCAT: 899 };
export const SSB_MODULE_PRICE = 899;
