export interface CandidateAccount {
  role: 'candidate';
  name: string;
  email: string;
  phone: string;
}

export interface ParentAccount {
  role: 'parent';
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  inviteCode: string;
  inviteAccepted: boolean;
}

export type Account = CandidateAccount | ParentAccount;
