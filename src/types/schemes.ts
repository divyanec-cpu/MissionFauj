export type FailCheck = 'pcm' | 'education' | 'age' | 'marital' | 'ncc';

/**
 * One row of the admin-configurable eligibility table. Official notifications
 * change yearly, so every rule that can change lives here as data — none of
 * it is hardcoded per-scheme in the eligibility engine or the UI.
 */
export interface SchemeRule {
  id: string;
  name: string;
  branch: string;
  ageMin: number;
  ageMax: number;
  education: '12th' | 'graduate';
  requiresPCM?: boolean;
  /** Subject-list wording used in the fail reason when requiresPCM is true. */
  pcmLabel?: string;
  marital: 'unmarried' | 'any';
  requiresNCC?: boolean;
  /** Which failing check to surface first when several checks fail at once. */
  failPriority: FailCheck[];
  okReason: string;
}

export interface SchemeResult {
  id: string;
  name: string;
  branch: string;
  eligible: boolean;
  reason: string;
}
