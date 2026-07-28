import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/layout/AppHeader';
import { Stepper } from '../../components/layout/Stepper';
import { useAppState } from '../../context/AppStateContext';
import type { CandidatePath } from '../../types/candidatePath';
import { PathStep } from './steps/PathStep';
import { NameStep } from './steps/NameStep';
import { EligibilityPromptStep } from './steps/EligibilityPromptStep';

type Step = 'path' | 'name' | 'eligibility-prompt';

const STEP_LABELS = ['Path', 'Name', 'Eligibility'];

function activeIndexFor(step: Step): number {
  if (step === 'path') return 0;
  if (step === 'name') return 1;
  return 2;
}

// The one-time mandatory setup: just a name and "what brings you here" — the
// detailed eligibility questionnaire lives at EligibilityCheckPage now,
// reachable any time from the header, never a gate on prep content.
export function OnboardingPage() {
  const appState = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('path');
  const [path, setPath] = useState<CandidatePath | null>(null);
  const [name, setName] = useState<string | null>(null);

  // completeSetup is deliberately NOT called here — writing candidateName to
  // context would immediately flip RootGate from OnboardingPage to HomePage
  // (it gates on candidateName alone), unmounting this component before the
  // eligibility-prompt step ever gets a chance to render. Name/path are kept
  // in local state until the candidate actually leaves onboarding below.
  const finishSetup = (candidateName: string) => {
    setName(candidateName);
    setStep('eligibility-prompt');
  };

  const leaveOnboarding = (destination: string) => {
    appState.completeSetup(name!, path!);
    navigate(destination);
  };

  return (
    <div className="texture-hatch flex min-h-screen flex-col">
      <AppHeader pageLabel="Get Started" right={<Stepper steps={STEP_LABELS} activeIndex={activeIndexFor(step)} />} />
      <main className="flex flex-1 justify-center px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div className="w-full max-w-[920px]">
          {step === 'path' && <PathStep selected={path} onSelect={setPath} onContinue={() => setStep('name')} />}
          {step === 'name' && <NameStep onSubmit={finishSetup} />}
          {step === 'eligibility-prompt' && (
            <EligibilityPromptStep
              onTakeTest={() => leaveOnboarding('/eligibility-check')}
              onSkip={() => leaveOnboarding('/')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
