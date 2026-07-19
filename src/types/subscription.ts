export type SubscriptionState = 'none' | 'trial' | 'subscribed';
export type WrittenExam = 'NDA' | 'CDS' | 'AFCAT';

export interface AiUsage {
  ssbAssistant: number;
  digestAssist: number;
}

export interface SsbRegistration {
  scheme: string;
  attempts: string;
}
