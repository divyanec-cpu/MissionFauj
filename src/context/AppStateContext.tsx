import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { migrateUnscopedKeys, readPersisted, usePersistedState } from '../lib/usePersistedState';
import { trackSubscriptionEvent } from '../lib/contentApi';
import { fetchRemoteState, pushRemoteState } from '../lib/stateApi';
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
// Spread over any stored value on read, so an account saved before a counter
// existed picks up the new one at 0 rather than undefined.
const DEFAULT_AI_USAGE: AiUsage = { ssbAssistant: 0, digestAssist: 0, general: 0 };

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
  /** Mirrors the server's authoritative counters after an AI call. Replaces an
   *  earlier local increment: the cap is enforced server-side now, so a second
   *  independent tally here could only ever disagree with it. */
  applyServerAiUsage: (usage: Partial<AiUsage>) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

/**
 * Everything except `auth` belongs to one specific candidate, so it is stored
 * under a key scoped to their verified phone rather than in one flat bucket
 * shared by whoever happens to hold the device. `auth` itself stays unscoped —
 * it is the record of *who* is signed in, and it's what selects the scope.
 *
 * This is what lets sign-out be a plain logout that destroys nothing: the same
 * candidate signing back in finds their own bucket untouched, while a different
 * candidate signing in on the same device gets an empty one and can't see the
 * previous person's name, path, profile or subscriptions.
 *
 * The phone is no more exposed here than it already is inside the stored `auth`
 * value. Note this scopes data per candidate, it does not secure it — anything
 * in localStorage is readable by anyone who can open devtools on the device.
 * Real isolation needs the data to live server-side behind the session JWT.
 */
const PER_CANDIDATE_KEYS = [
  'candidateName',
  'candidatePath',
  'profile',
  'eligibilityResults',
  'writtenSubscriptions',
  'ssbSubscription',
  'ssbRegistration',
  'aiUsage',
];

function scopedKeyFor(phone: string | null) {
  return (bare: string) => (phone ? `u:${phone}:${bare}` : `anon:${bare}`);
}

// Runs once on import, before the provider mounts and before any hook below
// reads its bucket — deliberately not in a component, so React's StrictMode
// double-render can't run it twice.
const bootPhone = readPersisted<VerifiedAuth | null>('auth', null)?.candidatePhone ?? null;
migrateUnscopedKeys(PER_CANDIDATE_KEYS, bootPhone ? scopedKeyFor(bootPhone) : null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = usePersistedState<VerifiedAuth | null>('auth', null);
  const key = scopedKeyFor(auth?.candidatePhone ?? null);

  const [candidateName, setCandidateName] = usePersistedState<string | null>(key('candidateName'), null);
  const [candidatePath, setCandidatePath] = usePersistedState<CandidatePath | null>(key('candidatePath'), null);
  const [profile, setProfile] = usePersistedState<CandidateProfile | null>(key('profile'), null);
  const [eligibilityResults, setEligibilityResults] = usePersistedState<SchemeResult[] | null>(
    key('eligibilityResults'),
    null,
  );
  const [writtenSubscriptions, setWrittenSubscriptions] = usePersistedState<WrittenSubscriptions>(
    key('writtenSubscriptions'),
    DEFAULT_WRITTEN_SUBSCRIPTIONS,
  );
  const [ssbSubscription, setSsbSubscription] = usePersistedState<SubscriptionState>(key('ssbSubscription'), 'none');
  const [ssbRegistration, setSsbRegistration] = usePersistedState<SsbRegistration | null>(key('ssbRegistration'), null);
  const [storedAiUsage, setAiUsage] = usePersistedState<AiUsage>(key('aiUsage'), DEFAULT_AI_USAGE);
  // Accounts written before a counter existed have it missing rather than 0,
  // which would read as undefined and increment to NaN. Merging defaults on
  // read means adding a counter later never needs a data migration.
  const aiUsage = useMemo<AiUsage>(() => ({ ...DEFAULT_AI_USAGE, ...storedAiUsage }), [storedAiUsage]);

  // ---------------------------------------------------------------------
  // Sync with the server, so a candidate's profile and entitlements survive
  // losing, wiping or replacing the device. localStorage stays the working
  // copy — the app must remain fully usable offline and on a sleeping free-tier
  // backend — and the server is the durable one, consulted at sign-in.
  // ---------------------------------------------------------------------
  const sessionToken = auth?.sessionToken;
  // Which token we have finished hydrating for. Pushes are refused until this
  // matches, so a fresh device can never overwrite stored state with its empty
  // one before it has looked at what the server holds.
  //
  // Deliberately state and not a ref: a ref was the first attempt and silently
  // broke syncing outright. Hydration finishes inside a promise callback, and
  // mutating a ref there re-renders nothing, so the push effect — which had
  // already run once and bailed because hydration was incomplete — never ran
  // again and nothing was ever uploaded. It typechecked and looked right.
  const [hydratedToken, setHydratedToken] = useState<string | null>(null);
  const lastPushed = useRef<string | null>(null);

  const syncPayload = useMemo(
    () => ({
      candidateName,
      candidatePath,
      profile,
      eligibilityResults,
      writtenSubscriptions,
      ssbSubscription,
      ssbRegistration,
      aiUsage,
    }),
    [candidateName, candidatePath, profile, eligibilityResults, writtenSubscriptions, ssbSubscription, ssbRegistration, aiUsage],
  );
  const serializedPayload = JSON.stringify(syncPayload);

  useEffect(() => {
    if (!sessionToken || hydratedToken === sessionToken) return;
    let cancelled = false;

    fetchRemoteState(sessionToken)
      .then((remote) => {
        if (cancelled) return;
        if (remote) {
          // The server has this candidate on record: adopt it wholesale. This
          // is the moment a reinstalled phone gets its subscription back.
          const nextName = typeof remote.candidateName === 'string' ? remote.candidateName : null;
          const nextPath =
            remote.candidatePath === 'school' || remote.candidatePath === 'graduate' || remote.candidatePath === 'ssb-only'
              ? remote.candidatePath
              : null;
          const nextWritten =
            remote.writtenSubscriptions && typeof remote.writtenSubscriptions === 'object'
              ? { ...DEFAULT_WRITTEN_SUBSCRIPTIONS, ...(remote.writtenSubscriptions as WrittenSubscriptions) }
              : DEFAULT_WRITTEN_SUBSCRIPTIONS;
          const nextSsb = typeof remote.ssbSubscription === 'string' ? (remote.ssbSubscription as SubscriptionState) : 'none';
          const nextAiUsage =
            remote.aiUsage && typeof remote.aiUsage === 'object'
              ? { ...DEFAULT_AI_USAGE, ...(remote.aiUsage as AiUsage) }
              : DEFAULT_AI_USAGE;

          setCandidateName(nextName);
          setCandidatePath(nextPath);
          setProfile((remote.profile ?? null) as CandidateProfile | null);
          setEligibilityResults((remote.eligibilityResults ?? null) as SchemeResult[] | null);
          setWrittenSubscriptions(nextWritten);
          setSsbSubscription(nextSsb);
          setSsbRegistration((remote.ssbRegistration ?? null) as SsbRegistration | null);
          setAiUsage(nextAiUsage);

          // Record what we just adopted so the state change we caused doesn't
          // immediately echo back up as a redundant write.
          lastPushed.current = JSON.stringify({
            candidateName: nextName,
            candidatePath: nextPath,
            profile: (remote.profile ?? null) as CandidateProfile | null,
            eligibilityResults: (remote.eligibilityResults ?? null) as SchemeResult[] | null,
            writtenSubscriptions: nextWritten,
            ssbSubscription: nextSsb,
            ssbRegistration: (remote.ssbRegistration ?? null) as SsbRegistration | null,
            aiUsage: nextAiUsage,
          });
        } else {
          // Nothing stored for this number yet — every candidate from before
          // syncing existed lands here, so their device is the source of truth
          // exactly once and gets uploaded rather than wiped.
          lastPushed.current = null;
        }
        setHydratedToken(sessionToken);
      })
      .catch(() => {
        // Offline, backend asleep, or session expired. Deliberately leaves
        // hydratedToken unset so nothing is pushed: the app keeps running on
        // local state, and syncing resumes on a later successful sign-in.
      });

    return () => {
      cancelled = true;
    };
  }, [
    sessionToken,
    hydratedToken,
    setCandidateName,
    setCandidatePath,
    setProfile,
    setEligibilityResults,
    setWrittenSubscriptions,
    setSsbSubscription,
    setSsbRegistration,
    setAiUsage,
  ]);

  useEffect(() => {
    if (!sessionToken || hydratedToken !== sessionToken) return;
    if (lastPushed.current === serializedPayload) return;
    // Debounced: pill taps and trial starts arrive in bursts, and each one
    // would otherwise be its own request.
    const timer = setTimeout(() => {
      pushRemoteState(sessionToken, syncPayload)
        .then(() => {
          lastPushed.current = serializedPayload;
        })
        .catch(() => {
          // Left unrecorded so the next change retries; a failed sync must
          // never surface as an error to someone mid-exercise.
        });
    }, 1200);
    return () => clearTimeout(timer);
  }, [sessionToken, hydratedToken, serializedPayload, syncPayload]);

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
      // Clearing `auth` is the whole of sign-out, and it destroys nothing: it
      // just stops selecting a scope (see PER_CANDIDATE_KEYS above), so the
      // candidate's own data sits untouched in their bucket until they sign
      // back in with the same number. Deleting it here would be the wrong fix
      // for shared devices — the scoping already stops the next candidate
      // seeing it, without costing this one their progress.
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
      // Defaults are spread under the server's values so a counter the server
      // hasn't stored yet reads 0 rather than undefined.
      applyServerAiUsage: (usage) => setAiUsage((prev) => ({ ...DEFAULT_AI_USAGE, ...prev, ...usage })),
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
