import { useState } from 'react';
import { CDS_TRACKS, getCdsSubjects, type CdsTrack } from '../../data/cdsSubjects';
import { MOCK_TESTS, type MockTest } from '../../data/mockQuestionBanks';
import { DIGEST_POSTS } from '../../data/digestPosts';
import { PillButton } from '../../components/ui/PillButton';
import { CurrentAffairsDigest } from './CurrentAffairsDigest';

interface CdsHubProps {
  onOpenMockTest: (test: MockTest) => void;
  unlocked: boolean;
  onOpenPricing: () => void;
}

export function CdsHub({ onOpenMockTest, unlocked, onOpenPricing }: CdsHubProps) {
  const [track, setTrack] = useState<CdsTrack>('IMA/INA/AFA');
  const isOta = track === 'OTA (Non-Tech)';
  const subjects = getCdsSubjects(track);
  const mocks = MOCK_TESTS.filter((m) => m.exam === 'CDS').map((m) => ({
    ...m,
    meta: m.name === 'Full-Length — Maths' && isOta ? 'Not applicable (OTA)' : m.meta,
  }));

  return (
    <div className="flex flex-col gap-6.5 animate-rise-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wide text-amber uppercase">CDS — Written Exam</div>
          <h2 className="font-heading text-3xl font-bold tracking-wide uppercase">Track &amp; Subjects</h2>
        </div>
        <div className="flex gap-2">
          {CDS_TRACKS.map((t) => (
            <PillButton key={t} active={track === t} onClick={() => setTrack(t)}>
              {t}
            </PillButton>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subj) => (
          <div
            key={subj.name}
            className={`bg-bg-panel border border-border flex flex-col gap-2.5 p-5 ${subj.progress === 0 && isOta ? 'opacity-40' : ''}`}
          >
            <div className="font-heading text-lg font-bold uppercase">{subj.name}</div>
            <div className="text-xs text-muted">{subj.note}</div>
            <div className="bg-bg-panel-2 mt-1 h-1.5">
              <div className="h-full bg-amber" style={{ width: `${subj.progress}%` }} />
            </div>
            <div className="text-[11px] text-muted">{subj.progress}% covered</div>
          </div>
        ))}
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
