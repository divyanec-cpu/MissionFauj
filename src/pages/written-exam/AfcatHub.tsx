import { useState } from 'react';
import { AFCAT_SUBJECTS, EKT_BRANCHES, EKT_TOPICS, type EktBranch } from '../../data/afcatSubjects';
import { EKT_QUESTION_BANKS, MOCK_TESTS, type MockTest } from '../../data/mockQuestionBanks';
import { DIGEST_POSTS } from '../../data/digestPosts';
import { PillButton } from '../../components/ui/PillButton';
import { CurrentAffairsDigest } from './CurrentAffairsDigest';

interface AfcatHubProps {
  onOpenMockTest: (test: MockTest) => void;
  unlocked: boolean;
  onOpenPricing: () => void;
}

export function AfcatHub({ onOpenMockTest, unlocked, onOpenPricing }: AfcatHubProps) {
  const [ektBranch, setEktBranch] = useState<EktBranch>('Mechanical');
  const afcatFull = MOCK_TESTS.find((m) => m.id === 'afcat-full')!;
  const ektMock: MockTest = {
    id: `ekt-${ektBranch}`,
    exam: 'AFCAT',
    name: `EKT — ${ektBranch}`,
    meta: '45 min · 50 Q',
    durationSec: 5 * 60,
    questions: EKT_QUESTION_BANKS[ektBranch],
  };
  const mocks: MockTest[] = [
    afcatFull,
    ektMock,
    { id: 'afcat-sectional-reasoning', exam: 'AFCAT', name: 'Sectional — Reasoning', meta: '20 min · 25 Q', durationSec: 4 * 60, questions: afcatFull.questions.slice(1) },
  ];

  return (
    <div className="flex flex-col gap-6.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">AFCAT — Written Exam</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase">Two Tracks</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-bg-panel border border-border border-t-4 border-t-amber p-5">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="font-heading text-lg font-bold uppercase">AFCAT (Common)</div>
            <div className="border border-eligible px-2 py-0.5 text-[10px] tracking-wide text-eligible uppercase">
              +3 / −1 / 0
            </div>
          </div>
          <div className="mb-3.5 text-xs text-muted">Required for every applicant, all branches.</div>
          <div className="flex flex-col gap-2">
            {AFCAT_SUBJECTS.map((s) => (
              <div key={s.name} className="bg-bg-panel-2 border border-border flex justify-between px-3.5 py-2.5 text-[13px]">
                {s.name}
                <span className="text-[11px] text-muted">{s.count} q</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-panel border border-border border-t-4 border-t-steel p-5">
          <div className="font-heading mb-1.5 text-lg font-bold uppercase">EKT (Technical, Optional)</div>
          <div className="mb-3.5 text-xs text-muted">Only for candidates applying to a technical branch.</div>
          <div className="mb-3.5 flex flex-wrap gap-2">
            {EKT_BRANCHES.map((b) => (
              <PillButton key={b} active={ektBranch === b} onClick={() => setEktBranch(b)} size="sm">
                {b}
              </PillButton>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {EKT_TOPICS[ektBranch].map((t) => (
              <div key={t} className="bg-bg-panel-2 border border-border px-3.5 py-2.5 text-[13px]">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="font-heading mb-3 text-sm font-bold tracking-wide uppercase">Mock Tests</div>
        <div className="flex flex-wrap gap-3.5">
          {mocks.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpenMockTest(m)}
              className="bg-bg-panel border border-border min-w-[160px] cursor-pointer px-4.5 py-3.5 text-left text-[13px]"
            >
              <div className="font-semibold">{m.name}</div>
              <div className="mt-1 text-[11px] text-muted">{m.meta}</div>
            </button>
          ))}
        </div>
      </div>

      <CurrentAffairsDigest posts={DIGEST_POSTS} horizontal unlocked={unlocked} onOpenPricing={onOpenPricing} />
    </div>
  );
}
