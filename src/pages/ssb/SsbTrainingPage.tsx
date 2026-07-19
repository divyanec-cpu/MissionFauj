import { useEffect, useState } from 'react';
import { AppHeader } from '../../components/layout/AppHeader';
import { Stepper } from '../../components/layout/Stepper';
import { useAppState } from '../../context/AppStateContext';
import type { SsbModule } from '../../types/ssb';
import { SSB_ENTRY_SCHEMES, SSB_ATTEMPT_OPTIONS } from '../../data/entrySchemes';
import { getModuleOlqTags } from '../../data/moduleTags';
import { WelcomeStep } from './steps/WelcomeStep';
import { SchemeStep } from './steps/SchemeStep';
import { AttemptsStep } from './steps/AttemptsStep';
import { ModuleHub } from './steps/ModuleHub';
import { ModulePaywall } from './ModulePaywall';
import { ModuleUnlocked } from './ModuleUnlocked';
import { SelfReviewRubric } from '../../components/ssb/SelfReviewRubric';
import { EnglishConfidenceBonus } from './EnglishConfidenceBonus';
import { AiAssistantBonus } from './AiAssistantBonus';
import { WatRunner } from './modules/WatRunner';
import { TatRunner } from './modules/TatRunner';
import { SrtRunner } from './modules/SrtRunner';
import { SelfDescriptionRunner } from './modules/SelfDescriptionRunner';
import { PpdtRunner } from './modules/PpdtRunner';
import { LecturetteRunner } from './modules/LecturetteRunner';
import { GroupTaskRunner } from './modules/GroupTaskRunner';
import { PiqInterviewRunner } from './modules/PiqInterviewRunner';

type View = 'welcome' | 'scheme' | 'attempts' | 'hub' | 'paywall' | 'unlocked' | 'runner' | 'rubric' | 'english' | 'ai';

const STEP_LABELS = ['Register', 'Entry Type', 'Attempts', 'Modules'];

function activeIndexFor(view: View): number {
  if (view === 'welcome') return 0;
  if (view === 'scheme') return 1;
  if (view === 'attempts') return 2;
  return 3;
}

const AI_MODULE: SsbModule = {
  id: 'AI Assistant',
  name: 'AI Assistant',
  desc: 'Unlimited AI Assistant access, plus every SSB training module.',
};

export function SsbTrainingPage() {
  const appState = useAppState();
  const [view, setView] = useState<View>('welcome');
  const [scheme, setScheme] = useState(SSB_ENTRY_SCHEMES[0]);
  const [attempts, setAttempts] = useState(SSB_ATTEMPT_OPTIONS[0]);
  const [selectedModule, setSelectedModule] = useState<SsbModule | null>(null);
  const [pendingReturnView, setPendingReturnView] = useState<'runner' | 'ai'>('runner');

  useEffect(() => {
    if (appState.ssbRegistration) {
      setScheme(appState.ssbRegistration.scheme);
      setAttempts(appState.ssbRegistration.attempts);
      setView('hub');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmRegistration = () => {
    appState.registerSsb({ scheme, attempts });
    setView('hub');
  };

  const unlocked = appState.ssbSubscription !== 'none';

  const startModule = (module: SsbModule) => {
    if (module.id === 'English & Confidence') {
      setView('english');
      return;
    }
    if (module.id === 'AI Assistant') {
      setView('ai');
      return;
    }
    setSelectedModule(module);
    setPendingReturnView('runner');
    setView(unlocked ? 'unlocked' : 'paywall');
  };

  const openAiPaywall = () => {
    setSelectedModule(AI_MODULE);
    setPendingReturnView('ai');
    setView(unlocked ? 'unlocked' : 'paywall');
  };

  const enterModuleContent = () => {
    if (selectedModule?.id === 'OLQ Self-Assessment') {
      setView('rubric');
    } else if (pendingReturnView === 'ai') {
      setView('ai');
    } else {
      setView('runner');
    }
  };

  const goToModules = () => setView('hub');

  const isRegistering = view === 'welcome' || view === 'scheme' || view === 'attempts' || view === 'hub';

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        pageLabel="SSB Training"
        right={
          isRegistering ? (
            <Stepper steps={STEP_LABELS} activeIndex={activeIndexFor(view)} />
          ) : (
            <button
              type="button"
              onClick={goToModules}
              className="font-heading cursor-pointer border border-border bg-transparent px-4.5 py-2.5 text-[13px] font-semibold tracking-wide text-muted uppercase"
            >
              ← Back to Modules
            </button>
          )
        }
      />
      <main className="flex flex-1 justify-center px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div className="w-full max-w-[880px]">
          {view === 'welcome' && <WelcomeStep onBegin={() => setView('scheme')} />}

          {view === 'scheme' && (
            <SchemeStep
              scheme={scheme}
              onChange={setScheme}
              onBack={() => setView('welcome')}
              onContinue={() => setView('attempts')}
            />
          )}

          {view === 'attempts' && (
            <AttemptsStep
              attempts={attempts}
              onChange={setAttempts}
              onBack={() => setView('scheme')}
              onContinue={confirmRegistration}
            />
          )}

          {view === 'hub' && <ModuleHub scheme={scheme} attempts={attempts} onStartModule={startModule} />}

          {view === 'paywall' && selectedModule && (
            <ModulePaywall
              moduleName={selectedModule.name}
              moduleDesc={selectedModule.desc}
              scheme={scheme}
              isExistingMember={appState.isExistingMember}
              onStartTrial={() => {
                appState.startSsbTrial();
                enterModuleContent();
              }}
            />
          )}

          {view === 'unlocked' && selectedModule && (
            <ModuleUnlocked moduleName={selectedModule.name} moduleDesc={selectedModule.desc} onEnter={enterModuleContent} />
          )}

          {view === 'runner' && selectedModule && (
            <>
              {selectedModule.id === 'WAT' && <WatRunner onComplete={() => setView('rubric')} />}
              {selectedModule.id === 'TAT' && <TatRunner onComplete={() => setView('rubric')} />}
              {selectedModule.id === 'SRT' && <SrtRunner onComplete={() => setView('rubric')} />}
              {selectedModule.id === 'Self Description' && (
                <SelfDescriptionRunner onComplete={() => setView('rubric')} />
              )}
              {selectedModule.id === 'PPDT' && <PpdtRunner onComplete={() => setView('rubric')} />}
              {selectedModule.id === 'Lecturette' && <LecturetteRunner onComplete={() => setView('rubric')} />}
              {selectedModule.id === 'Group Tasks' && <GroupTaskRunner onComplete={() => setView('rubric')} />}
              {selectedModule.id === 'PIQ & Interview Prep' && (
                <PiqInterviewRunner scheme={scheme} onComplete={() => setView('rubric')} />
              )}
            </>
          )}

          {view === 'rubric' && selectedModule && (
            <SelfReviewRubric
              moduleName={selectedModule.name}
              tags={getModuleOlqTags(selectedModule.id)}
              onDone={goToModules}
            />
          )}

          {view === 'english' && <EnglishConfidenceBonus />}

          {view === 'ai' && <AiAssistantBonus onUnlock={openAiPaywall} />}
        </div>
      </main>
    </div>
  );
}
