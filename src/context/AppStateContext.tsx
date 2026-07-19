import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { usePersistedState } from '../lib/usePersistedState';
import type { CandidateProfile } from '../types/profile';
import type { SchemeResult } from '../types/schemes';
import type { AiUsage, SsbRegistration, SubscriptionState, WrittenExam } from '../types/subscription';
import type { Account, CandidateAccount, ParentAccount } from '../types/account';

interface WrittenSubscriptions {
  NDA: SubscriptionState;
  CDS: SubscriptionState;
  AFCAT: SubscriptionState;
}

const DEFAULT_WRITTEN_SUBSCRIPTIONS: WrittenSubscriptions = { NDA: 'none', CDS: 'none', AFCAT: 'none' };
const DEFAULT_AI_USAGE: AiUsage = { ssbAssistant: 0, digestAssist: 0 };

interface AppStateValue {
  account: Account | null;
  profile: CandidateProfile | null;
  eligibilityResults: SchemeResult[] | null;
  writtenSubscriptions: WrittenSubscriptions;
  ssbSubscription: SubscriptionState;
  ssbRegistration: SsbRegistration | null;
  aiUsage: AiUsage;
  isExistingMember: boolean;
  registerCandidate: (details: Omit<CandidateAccount, 'role'>) => void;
  registerParent: (details: Omit<ParentAccount, 'role' | 'inviteCode' | 'inviteAccepted'>) => string;
  acceptInvite: () => void;
  setProfileAndEligibility: (profile: CandidateProfile, results: SchemeResult[]) => void;
  resetOnboarding: () => void;
  startWrittenTrial: (exam: WrittenExam) => void;
  startSsbTrial: () => void;
  registerSsb: (registration: SsbRegistration) => void;
  incrementAiUsage: (kind: keyof AiUsage) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = usePersistedState<Account | null>('account', null);
  const [profile, setProfile] = usePersistedState<CandidateProfile | null>('profile', null);
  const [eligibilityResults, setEligibilityResults] = usePersistedState<SchemeResult[] | null>(
    'eligibilityResults',
    null,
  );
  const [writtenSubscriptions, setWrittenSubscriptions] = usePersistedState<WrittenSubscriptions>(
    'writtenSubscriptions',
    DEFAULT_WRITTEN_SUBSCRIPTIONS,
  );
  const [ssbSubscription, setSsbSubscription] = usePersistedState<SubscriptionState>('ssbSubscription', 'none');
  const [ssbRegistration, setSsbRegistration] = usePersistedState<SsbRegistration | null>('ssbRegistration', null);
  const [aiUsage, setAiUsage] = usePersistedState<AiUsage>('aiUsage', DEFAULT_AI_USAGE);

  const value = useMemo<AppStateValue>(() => {
    const isExistingMember = Object.values(writtenSubscriptions).some((s) => s !== 'none');

    return {
      account,
      profile,
      eligibilityResults,
      writtenSubscriptions,
      ssbSubscription,
      ssbRegistration,
      aiUsage,
      isExistingMember,
      registerCandidate: (details) => setAccount({ role: 'candidate', ...details }),
      registerParent: (details) => {
        const inviteCode = generateInviteCode();
        setAccount({ role: 'parent', inviteCode, inviteAccepted: false, ...details });
        return inviteCode;
      },
      acceptInvite: () => {
        setAccount((prev) => (prev && prev.role === 'parent' ? { ...prev, inviteAccepted: true } : prev));
      },
      setProfileAndEligibility: (nextProfile, results) => {
        setProfile(nextProfile);
        setEligibilityResults(results);
      },
      resetOnboarding: () => {
        setAccount(null);
        setProfile(null);
        setEligibilityResults(null);
      },
      startWrittenTrial: (exam) => {
        setWrittenSubscriptions((prev) => ({ ...prev, [exam]: prev[exam] === 'subscribed' ? 'subscribed' : 'trial' }));
      },
      startSsbTrial: () => {
        setSsbSubscription((prev) => (prev === 'subscribed' ? 'subscribed' : 'trial'));
      },
      registerSsb: (registration) => setSsbRegistration(registration),
      incrementAiUsage: (kind) => setAiUsage((prev) => ({ ...prev, [kind]: prev[kind] + 1 })),
    };
  }, [
    account,
    profile,
    eligibilityResults,
    writtenSubscriptions,
    ssbSubscription,
    ssbRegistration,
    aiUsage,
    setAccount,
    setProfile,
    setEligibilityResults,
    setWrittenSubscriptions,
    setSsbSubscription,
    setSsbRegistration,
    setAiUsage,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
