import { useEffect, useRef, useState } from 'react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Stepper } from '../../components/layout/Stepper';
import { useAppState } from '../../context/AppStateContext';
import { evaluateSchemes } from '../../lib/eligibilityEngine';
import { fetchEligibilityRules } from '../../lib/contentApi';
import { DEFAULT_PROFILE, type CandidateProfile } from '../../types/profile';
import type { SchemeResult, SchemeRule } from '../../types/schemes';
import { BriefingStep } from './steps/BriefingStep';
import { ProfileStep } from './steps/ProfileStep';
import { ScanningStep } from './steps/ScanningStep';
import { ReportStep } from './steps/ReportStep';
import { PrepTeaserStep } from './steps/PrepTeaserStep';

type Step = 'briefing' | 'profile' | 'scanning' | 'report' | 'prep';

const STEP_LABELS = ['Briefing', 'Profile', 'Assessment', 'Explore'];

function activeIndexFor(step: Step): number {
  if (step === 'briefing') return 0;
  if (step === 'profile') return 1;
  if (step === 'prep') return 3;
  return 2; // scanning + report
}

// A standalone, optional tool — reachable from the header any time, never a
// gate on Written Exam Prep or SSB Training. Candidates who already know
// what they want to study can skip this entirely; this only exists for
// those curious which specific entry schemes they qualify for.
export function EligibilityCheckPage() {
  const appState = useAppState();
  const [step, setStep] = useState<Step>('briefing');
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_PROFILE);
  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [rules, setRules] = useState<SchemeRule[]>([]);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Already run once before — jump straight to the report instead of
    // forcing the questionnaire again.
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

  const runScan = () => {
    setStep('scanning');
    setScanProgress(0);
    scanTimer.current = setTimeout(() => setScanProgress(100), 60);
    advanceTimer.current = setTimeout(() => {
      const computed = evaluateSchemes(profile, rules);
      setResults(computed);
      appState.setProfileAndEligibility(profile, computed);
      setStep('report');
    }, 1700);
  };

  const retakeBriefing = () => {
    appState.resetEligibilityCheck();
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
          {step === 'scanning' && <ScanningStep scanProgress={scanProgress} schemeNames={rules.map((r) => r.name)} />}
          {rulesError && step === 'scanning' && <div className="mt-3 text-[13px] text-not-eligible">{rulesError}</div>}
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
