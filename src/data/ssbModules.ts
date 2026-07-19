import type { SsbModule } from '../types/ssb';

export const PSYCH_MODULES: SsbModule[] = [
  { id: 'TAT', name: 'TAT', desc: '30s image view, 4 min write per image. Self-review after the set.' },
  { id: 'WAT', name: 'WAT', desc: '15s per word, no backspace or edit during the window — enforced.' },
  { id: 'SRT', name: 'SRT', desc: 'Timed situation reactions, reviewed against the OLQ rubric.' },
  { id: 'Self Description', name: 'Self Description', desc: 'Timed write-up across five perspectives, self-reviewed.' },
];

export const GTO_MODULES: SsbModule[] = [
  { id: 'PPDT', name: 'PPDT', desc: '30s picture view, then narration and discussion — text + checklist, no recording.' },
  { id: 'Lecturette', name: 'Lecturette', desc: 'Timed countdown on a random topic — text notes + self-review checklist.' },
  { id: 'Group Tasks', name: 'Group Tasks', desc: 'GD and outdoor-task scenarios as text-based planning exercises.' },
];

export function interviewModules(scheme: string): SsbModule[] {
  return [
    { id: 'PIQ & Interview Prep', name: 'PIQ & Interview Prep', desc: `Question bank tuned to ${scheme}'s PIQ profile. Self-review, no AI scoring.` },
    { id: 'OLQ Self-Assessment', name: 'OLQ Self-Assessment', desc: 'Reflect across all 15 Officer-Like Qualities — no verdicts, just your own read.' },
  ];
}

export const BONUS_MODULES: SsbModule[] = [
  { id: 'English & Confidence', name: 'English & Confidence', desc: 'Free study material — grammar, vocabulary and spoken-confidence drills for interview day.' },
  { id: 'AI Assistant', name: 'AI Assistant', desc: 'Ask about OLQs, rubrics or how to structure a response. Explains and guides — never scores your psychology or interview answers.' },
];
