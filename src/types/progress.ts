/**
 * What this account has actually done. Every value here is recorded from a real
 * action — nothing is seeded, estimated, or back-filled, which is why a new
 * sign-up legitimately shows zeros rather than a plausible-looking history.
 *
 * Chapter completion previously lived as a `pct` field on the syllabus data
 * itself, which was the wrong home: progress belongs to the candidate, not to
 * the subject list. It is keyed here instead, so the same syllabus can be
 * shared by every account.
 */
export interface StudyProgress {
  /** Stable keys from `chapterKey()`. Membership means the candidate marked it done. */
  completedChapters: string[];
  /** Local YYYY-MM-DD dates the app was opened, ascending, capped to RETAINED_DAYS. */
  activeDates: string[];
  /** Kept explicitly, because it must survive dates ageing out of the window. */
  longestStreak: number;
}

export const DEFAULT_PROGRESS: StudyProgress = {
  completedChapters: [],
  activeDates: [],
  longestStreak: 0,
};

/** Enough to render the 7-day strip and absorb a gap, without growing forever. */
const RETAINED_DAYS = 60;

/** Local date, not UTC: a candidate studying at 1am IST is on today, not yesterday. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function chapterKey(exam: string, subject: string, chapter: string): string {
  return `${exam}::${subject}::${chapter}`;
}

function shiftDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + delta));
}

/**
 * Length of the unbroken run ending today — or ending yesterday, so a streak
 * still shows as live before the candidate has opened the app today rather than
 * appearing to have already collapsed to zero.
 */
export function currentStreak(progress: StudyProgress, today: string): number {
  const days = new Set(progress.activeDates);
  let cursor = days.has(today) ? today : shiftDays(today, -1);
  if (!days.has(cursor)) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

/** Oldest-to-newest activity for the last `count` days, for the dot strip. */
export function recentActivity(progress: StudyProgress, today: string, count = 7): boolean[] {
  const days = new Set(progress.activeDates);
  return Array.from({ length: count }, (_, i) => days.has(shiftDays(today, i - (count - 1))));
}

/**
 * Records that the app was opened today. Pure and idempotent — calling it
 * repeatedly within a day changes nothing, which matters because it runs on
 * every mount and React's StrictMode double-invokes effects in development.
 */
export function withTodayRecorded(progress: StudyProgress, today: string): StudyProgress {
  if (progress.activeDates.includes(today)) return progress;
  const activeDates = [...progress.activeDates, today].sort().slice(-RETAINED_DAYS);
  const next = { ...progress, activeDates };
  return { ...next, longestStreak: Math.max(next.longestStreak, currentStreak(next, today)) };
}
