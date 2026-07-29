export interface VerifiedAuth {
  candidatePhone: string;
  age: number;
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  consentAcceptedAt: string;
  /**
   * Session token for the per-candidate API, issued once consent is recorded.
   * Optional because sessions created before syncing existed don't carry one —
   * those keep working from local state and start syncing after a fresh
   * sign-in, rather than being forcibly logged out to obtain a token.
   */
  sessionToken?: string;
}
