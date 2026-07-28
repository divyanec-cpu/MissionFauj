import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { usePersistedState } from '../lib/usePersistedState';
import { trackSubscriptionEvent } from '../lib/contentApi';
import type { CandidateProfile } from '../types/profile';
import type { SchemeResult } from '../types/schemes';
import type { AiUsage, SsbRegistration, SubscriptionState, WrittenExam } from '../types/subscription';
import type { VerifiedAuth } from '../types/auth';
import type { CandidatePath } from '../types/candidatePath';

interface WrittenSubscriptions {
  NDA: SubscriptionState;
  CDS: SubscriptionState;
  AFCAT: SubscriptionState;
}

const DEFAULT_WRITTEN_SUBSCRIPTIONS: WrittenSubscriptions = { NDA: 'none', CDS: 'none', AFCAT: 'none' };
const DEFAULT_AI_USAGE: AiUsage = { ssbAssistant: 0, digestAssist: 0 };

interface AppStateValue {
  auth: VerifiedAuth | null;
  candidateName: string | null;
  candidatePath: CandidatePath | null;
  profile: CandidateProfile | null;
  eligibilityResults: SchemeResult[] | null;
  writtenSubscriptions: WrittenSubscriptions;
  ssbSubscription: SubscriptionState;
  ssbRegistration: SsbRegistration | null;
  aiUsage: AiUsage;
  isExistingMember: boolean;
  completeLogin: (auth: VerifiedAuth) => void;
  signOut: () => void;
  completeSetup: (name: string, path: CandidatePath) => void;
  changePath: (path: CandidatePath) => void;
  setProfileAndEligibility: (profile: CandidateProfile, results: SchemeResult[]) => void;
  resetEligibilityCheck: () => void;
  startWrittenTrial: (exam: WrittenExam) => void;
  startSsbTrial: () => void;
  registerSsb: (registration: SsbRegistration) => void;
  incrementAiUsage: (kind: keyof AiUsage) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = usePersistedState<VerifiedAuth | null>('auth', null);
  const [candidateName, setCandidateName] = usePersistedState<string | null>('candidateName', null);
  const [candidatePath, setCandidatePath] = usePersistedState<CandidatePath | null>('candidatePath', null);
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
      auth,
      candidateName,
      candidatePath,
      profile,
      eligibilityResults,
      writtenSubscriptions,
      ssbSubscription,
      ssbRegistration,
      aiUsage,
      isExistingMember,
      completeLogin: (nextAuth) => setAuth(nextAuth),
      // Just the login gate — profile, eligibility, and subscription state
      // stay put, so logging back in with the same number picks up right
      // where it left off. Login and onboarding/subscription data are
      // separate gates; only the former resets here. candidateName/
      // candidatePath survive sign-out for the same reason profile does.
      signOut: () => setAuth(null),
      // Ends the one-time slim onboarding (name + path). Both are set
      // together since the onboarding flow only ever finishes as a unit —
      // there's no supported state of "name set, path not yet chosen".
      completeSetup: (name, path) => {
        setCandidateName(name);
        setCandidatePath(path);
      },
      changePath: (path) => setCandidatePath(path),
      setProfileAndEligibility: (nextProfile, results) => {
        setProfile(nextProfile);
        setEligibilityResults(results);
      },
      // Retaking the (now optional) eligibility check clears only its own
      // data — deliberately does not touch `auth`, `candidateName`, or
      // `candidatePath`, since re-running a self-check shouldn't force a
      // candidate back through phone/OTP/consent or the one-time setup.
      resetEligibilityCheck: () => {
        setProfile(null);
        setEligibilityResults(null);
      },
      // The tracking call is deliberately outside the setState updater —
      // React (in StrictMode) invokes updater functions twice to surface
      // impure reducers, which would otherwise double-log this event.
      startWrittenTrial: (exam) => {
        if (writtenSubscriptions[exam] !== 'subscribed') trackSubscriptionEvent('written_trial', exam);
        setWrittenSubscriptions((prev) => ({ ...prev, [exam]: prev[exam] === 'subscribed' ? 'subscribed' : 'trial' }));
      },
      startSsbTrial: () => {
        if (ssbSubscription !== 'subscribed') trackSubscriptionEvent('ssb_trial');
        setSsbSubscription((prev) => (prev === 'subscribed' ? 'subscribed' : 'trial'));
      },
      registerSsb: (registration) => setSsbRegistration(registration),
      incrementAiUsage: (kind) => setAiUsage((prev) => ({ ...prev, [kind]: prev[kind] + 1 })),
    };
  }, [
    auth,
    candidateName,
    candidatePath,
    profile,
    eligibilityResults,
    writtenSubscriptions,
    ssbSubscription,
    ssbRegistration,
    aiUsage,
    setAuth,
    setCandidateName,
    setCandidatePath,
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
