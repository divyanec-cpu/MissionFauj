import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/layout/AppHeader';
import { Stepper } from '../../components/layout/Stepper';
import { ProfileStep } from '../../components/ProfileStep';
import { useAppState } from '../../context/AppStateContext';
import { evaluateSchemes } from '../../lib/eligibilityEngine';
import { fetchEligibilityRules } from '../../lib/contentApi';
import { emptyProfileDraft, isProfileComplete, type CandidateProfile, type ProfileDraft } from '../../types/profile';
import type { SchemeResult, SchemeRule } from '../../types/schemes';
import type { CandidatePath } from '../../types/candidatePath';
import { PathStep } from './steps/PathStep';
import { NameStep } from './steps/NameStep';
import { ScanningStep } from '../eligibility/steps/ScanningStep';
import { ReportStep } from '../eligibility/steps/ReportStep';

type Step = 'path' | 'name' | 'profile' | 'scanning' | 'report';

const STEP_LABELS = ['Path', 'Name', 'Profile', 'Result'];

function activeIndexFor(step: Step): number {
  if (step === 'path') return 0;
  if (step === 'name') return 1;
  if (step === 'profile') return 2;
  return 3; // scanning + report
}

// The one-time mandatory setup: path, name, and the full candidate profile
// (age is already verified at sign-in; everything else — gender, marital
// status, education, stream, NCC — is asked here so the eligibility scan
// that follows is built from real answers, never assumed defaults. The scan
// itself still never gates prep content — it's part of setup so it happens
// once, up front, instead of being left as a skippable afterthought.
export function OnboardingPage() {
  const appState = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('path');
  const [path, setPath] = useState<CandidatePath | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfileDraft(appState.auth?.age ?? 18));
  const [completedProfile, setCompletedProfile] = useState<CandidateProfile | null>(null);
  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [rules, setRules] = useState<SchemeRule[]>([]);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchEligibilityRules()
      .then(setRules)
      .catch((err) => setRulesError(err instanceof Error ? err.message : 'Could not load eligibility rules.'));
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // candidateName/candidatePath are deliberately NOT written to context until
  // leaveOnboarding — writing candidateName would immediately flip RootGate
  // from OnboardingPage to HomePage (it gates on candidateName alone),
  // unmounting this component before the scan/report steps ever render.
  const finishSetup = (candidateName: string) => {
    setName(candidateName);
    setStep('profile');
  };

  const runScan = () => {
    if (!isProfileComplete(profile)) return;
    setStep('scanning');
    setScanProgress(0);
    scanTimer.current = setTimeout(() => setScanProgress(100), 60);
    advanceTimer.current = setTimeout(() => {
      const computed = evaluateSchemes(profile, rules);
      setResults(computed);
      setCompletedProfile(profile);
      setStep('report');
    }, 1700);
  };

  const summaryLine = completedProfile
    ? `Age ${completedProfile.age} · ${completedProfile.education}${
        completedProfile.education.startsWith('Class 12') ? ' · ' + completedProfile.stream : ''
      } · ${completedProfile.gender} · ${completedProfile.marital} · NCC: ${completedProfile.ncc}`
    : '';

  const leaveOnboarding = () => {
    appState.completeSetup(name!, path!);
    appState.setProfileAndEligibility(completedProfile!, results!);
    navigate('/');
  };

  return (
    <div className="texture-hatch flex min-h-screen flex-col">
      <AppHeader pageLabel="Get Started" right={<Stepper steps={STEP_LABELS} activeIndex={activeIndexFor(step)} />} />
      <main className="flex flex-1 justify-center px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div className="w-full max-w-[920px]">
          {step === 'path' && <PathStep selected={path} onSelect={setPath} onContinue={() => setStep('name')} />}
          {step === 'name' && <NameStep onSubmit={finishSetup} />}
          {step === 'profile' && (
            <ProfileStep profile={profile} onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))} onSubmit={runScan} />
          )}
          {step === 'scanning' && <ScanningStep scanProgress={scanProgress} schemeNames={rules.map((r) => r.name)} />}
          {rulesError && step === 'scanning' && <div className="mt-3 text-[13px] text-not-eligible">{rulesError}</div>}
          {step === 'report' && results && (
            <ReportStep
              results={results}
              summaryLine={summaryLine}
              onRetake={() => setStep('profile')}
              onContinue={leaveOnboarding}
              retakeLabel="Redo Profile"
              continueLabel="Enter MissionFauj →"
            />
          )}
        </div>
      </main>
    </div>
  );
}
