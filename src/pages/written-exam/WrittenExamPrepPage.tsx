import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../components/layout/AppHeader';
import { PillButton } from '../../components/ui/PillButton';
import { useAppState } from '../../context/AppStateContext';
import type { WrittenExam } from '../../types/subscription';
import type { MockTest } from '../../data/mockQuestionBanks';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { NdaHub } from './NdaHub';
import { CdsHub } from './CdsHub';
import { AfcatHub } from './AfcatHub';
import { ChapterDetail } from './ChapterDetail';
import { FeaturesOverview } from './FeaturesOverview';
import { PricingPlansView } from './PricingPlansView';
import { MockTestRunner } from './MockTestRunner';
import { QuizRunner } from './QuizRunner';

type View = 'hub' | 'chapter' | 'features' | 'pricing' | 'mock-test' | 'quiz';

const NDA_SCHEME_IDS = ['nda-army', 'nda-navy', 'nda-af', 'naval-academy'];
const CDS_SCHEME_IDS = ['cds-ima', 'cds-ina', 'cds-afa', 'cds-ota'];
const AFCAT_SCHEME_IDS = ['afcat-flying', 'afcat-ground'];

/** NDA's official joining age (16.5) is a hard eligibility fact and stays accurate in the
 * eligibility report — but aspirants commonly start written-exam prep years earlier, so prep
 * access opens from age 15 regardless of whether they'd be old enough to join today. */
const MIN_NDA_PREP_AGE = 15;

export function WrittenExamPrepPage() {
  const appState = useAppState();
  const [examTab, setExamTab] = useState<WrittenExam>('NDA');
  const [view, setView] = useState<View>('hub');
  const [chapter, setChapter] = useState<{ subject: string; name: string } | null>(null);
  const [activeMockTest, setActiveMockTest] = useState<MockTest | null>(null);

  if (!appState.eligibilityResults) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader pageLabel="Written-Exam Prep" />
        <main className="flex flex-1 flex-col gap-4 px-5 pt-14 sm:px-8 lg:px-14">
          <div className="font-heading text-2xl font-bold uppercase">Complete the Eligibility Scan First</div>
          <p className="max-w-md text-sm text-muted">
            Written-exam prep is tailored to the schemes you're eligible for. Run the eligibility scan to unlock it.
          </p>
          <Link
            to="/"
            className="font-heading self-start border-none bg-amber px-6 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase no-underline"
          >
            Go to Eligibility Scan →
          </Link>
        </main>
      </div>
    );
  }

  const eligibleIds = new Set(appState.eligibilityResults.filter((r) => r.eligible).map((r) => r.id));
  const eligibleExams: WrittenExam[] = (['NDA', 'CDS', 'AFCAT'] as WrittenExam[]).filter((exam) => {
    if (exam === 'NDA') {
      const oldEnoughToPrep = (appState.profile?.age ?? 0) >= MIN_NDA_PREP_AGE;
      return oldEnoughToPrep || NDA_SCHEME_IDS.some((id) => eligibleIds.has(id));
    }
    const ids = exam === 'CDS' ? CDS_SCHEME_IDS : AFCAT_SCHEME_IDS;
    return ids.some((id) => eligibleIds.has(id));
  });
  const noEligibleExam = eligibleExams.length === 0;
  const effectiveExam = eligibleExams.includes(examTab) ? examTab : eligibleExams[0];
  const unlocked = effectiveExam ? appState.writtenSubscriptions[effectiveExam] !== 'none' : false;

  const backLabel =
    view === 'pricing' ? '← Back to App Overview' : view === 'features' ? `← Back to ${effectiveExam}` : `← Back to ${effectiveExam}`;

  const goBack = () => {
    if (view === 'pricing') setView('features');
    else setView('hub');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        pageLabel="Written-Exam Prep"
        right={
          view === 'hub' && !noEligibleExam ? (
            <div className="flex gap-2">
              {eligibleExams.map((exam) => (
                <PillButton key={exam} active={effectiveExam === exam} onClick={() => setExamTab(exam)}>
                  {exam}
                </PillButton>
              ))}
            </div>
          ) : view !== 'hub' ? (
            <button
              type="button"
              onClick={goBack}
              className="font-heading cursor-pointer border border-border bg-transparent px-4.5 py-2.5 text-[13px] font-semibold tracking-wide text-muted uppercase"
            >
              {backLabel}
            </button>
          ) : null
        }
      />
      <main className="flex-1 px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        {view === 'hub' && (
          <>
            {noEligibleExam ? (
              <div className="max-w-lg pt-10">
                <div className="font-heading text-2xl font-bold uppercase">No Written-Exam Track Yet</div>
                <p className="mt-3 text-muted">
                  Your eligibility scan didn't match NDA, CDS or AFCAT. SSB practice stays open for every entry
                  scheme regardless.
                </p>
                <Link
                  to="/ssb-training"
                  className="font-heading mt-5 inline-block border border-eligible px-5 py-3 text-sm font-semibold tracking-wide text-eligible uppercase no-underline"
                >
                  Enrol for SSB →
                </Link>
              </div>
            ) : (
              <>
                {effectiveExam === 'NDA' && (
                  <NdaHub
                    onOpenChapter={(subject, name) => {
                      setChapter({ subject, name });
                      setView('chapter');
                    }}
                    onOpenMockTest={(test) => {
                      setActiveMockTest(test);
                      setView('mock-test');
                    }}
                    unlocked={unlocked}
                    onOpenPricing={() => setView('pricing')}
                  />
                )}
                {effectiveExam === 'CDS' && (
                  <CdsHub
                    onOpenMockTest={(test) => {
                      setActiveMockTest(test);
                      setView('mock-test');
                    }}
                    unlocked={unlocked}
                    onOpenPricing={() => setView('pricing')}
                  />
                )}
                {effectiveExam === 'AFCAT' && (
                  <AfcatHub
                    onOpenMockTest={(test) => {
                      setActiveMockTest(test);
                      setView('mock-test');
                    }}
                    unlocked={unlocked}
                    onOpenPricing={() => setView('pricing')}
                  />
                )}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3.5 border border-border border-l-4 border-l-eligible bg-bg-panel px-5 py-4">
                  <div>
                    <div className="font-heading text-[15px] font-bold tracking-wide uppercase">
                      Cleared Your Written Exam?
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      SSB practice is open for every entry scheme, whenever you're ready.
                    </div>
                  </div>
                  <Link
                    to="/ssb-training"
                    className="font-heading border border-eligible px-5 py-2.5 text-[13px] font-bold tracking-wide whitespace-nowrap text-eligible uppercase no-underline"
                  >
                    Enrol for SSB →
                  </Link>
                </div>
                <div className="mt-3.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView('features')}
                    className="font-heading cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
                  >
                    See What MissionFauj Can Do →
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {view === 'chapter' && chapter && (
          <ChapterDetail
            exam={effectiveExam}
            subject={chapter.subject}
            chapter={chapter.name}
            onPracticeQuestions={() => setView('quiz')}
          />
        )}

        {view === 'features' && <FeaturesOverview onContinue={() => setView('pricing')} />}

        {view === 'pricing' && (
          <PricingPlansView
            exam={effectiveExam}
            onStartTrial={() => {
              appState.startWrittenTrial(effectiveExam);
              setView('hub');
            }}
          />
        )}

        {view === 'mock-test' && activeMockTest && (
          <MockTestRunner test={activeMockTest} onExit={() => setView('hub')} />
        )}

        {view === 'quiz' && (
          <QuizRunner
            title={effectiveExam}
            questions={QUIZ_QUESTIONS[effectiveExam]}
            onExit={() => setView('hub')}
          />
        )}
      </main>
    </div>
  );
}
