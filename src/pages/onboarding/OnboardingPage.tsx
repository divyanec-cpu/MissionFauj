import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Stepper } from '../../components/layout/Stepper';
import { useAppState } from '../../context/AppStateContext';
import { evaluateSchemes } from '../../lib/eligibilityEngine';
import { ELIGIBILITY_RULES } from '../../data/eligibilityRules';
import { DEFAULT_PROFILE, type CandidateProfile } from '../../types/profile';
import type { SchemeResult } from '../../types/schemes';
import { BriefingStep } from './steps/BriefingStep';
import { ProfileStep } from './steps/ProfileStep';
import { ScanningStep } from './steps/ScanningStep';
import { ReportStep } from './steps/ReportStep';
import { PrepTeaserStep } from './steps/PrepTeaserStep';

type Step = 'briefing' | 'profile' | 'scanning' | 'report' | 'prep';

const STEP_LABELS = ['Briefing', 'Profile', 'Assessment', 'Written Prep'];

function activeIndexFor(step: Step): number {
  if (step === 'briefing') return 0;
  if (step === 'profile') return 1;
  if (step === 'prep') return 3;
  return 2; // scanning + report
}

export function OnboardingPage() {
  const appState = useAppState();
  const [step, setStep] = useState<Step>('briefing');
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_PROFILE);
  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (appState.profile && appState.eligibilityResults) {
      setProfile(appState.profile);
      setResults(appState.eligibilityResults);
      setStep('report');
    } else if (appState.auth) {
      setProfile((prev) => ({ ...prev, age: appState.auth!.age }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const runScan = () => {
    setStep('scanning');
    setScanProgress(0);
    scanTimer.current = setTimeout(() => setScanProgress(100), 60);
    advanceTimer.current = setTimeout(() => {
      const computed = evaluateSchemes(profile, ELIGIBILITY_RULES);
      setResults(computed);
      appState.setProfileAndEligibility(profile, computed);
      setStep('report');
    }, 1700);
  };

  const retakeBriefing = () => {
    appState.resetOnboarding();
    setProfile({ ...DEFAULT_PROFILE, age: appState.auth?.age ?? DEFAULT_PROFILE.age });
    setResults(null);
    setScanProgress(0);
    setStep('briefing');
  };

  const summaryLine = `Age ${profile.age} · ${profile.education}${
    profile.education.startsWith('Class 12') ? ' · ' + profile.stream : ''
  } · ${profile.gender} · ${profile.marital} · NCC: ${profile.ncc}`;

  return (
    <div className="texture-hatch flex min-h-screen flex-col">
      <AppHeader
        pageLabel="Entry Scheme Eligibility Scan"
        right={<Stepper steps={STEP_LABELS} activeIndex={activeIndexFor(step)} />}
      />
      <main className="flex flex-1 justify-center px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div className="w-full max-w-[920px]">
          {step === 'briefing' && <BriefingStep onBegin={() => setStep('profile')} />}
          {step === 'profile' && (
            <ProfileStep
              profile={profile}
              onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
              onSubmit={runScan}
            />
          )}
          {step === 'scanning' && (
            <ScanningStep scanProgress={scanProgress} schemeNames={ELIGIBILITY_RULES.map((r) => r.name)} />
          )}
          {step === 'report' && results && (
            <ReportStep
              results={results}
              summaryLine={summaryLine}
              onRetake={retakeBriefing}
              onContinue={() => setStep('prep')}
            />
          )}
          {step === 'prep' && <PrepTeaserStep onBack={() => setStep('report')} />}
        </div>
      </main>
    </div>
  );
}
