export interface VerifiedAuth {
  candidatePhone: string;
  age: number;
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  consentAcceptedAt: string;
}
