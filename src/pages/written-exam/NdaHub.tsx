import { NDA_SUBJECTS } from '../../data/ndaChapters';
import { MOCK_TESTS, type MockTest } from '../../data/mockQuestionBanks';
import { DIGEST_POSTS } from '../../data/digestPosts';
import { CurrentAffairsDigest } from './CurrentAffairsDigest';

const STREAK_DAYS = [1, 1, 1, 1, 1, 1, 0];

function pctColor(pct: number) {
  if (pct >= 60) return 'text-eligible';
  if (pct > 0) return 'text-amber';
  return 'text-muted';
}

interface NdaHubProps {
  onOpenChapter: (subject: string, chapter: string) => void;
  onOpenMockTest: (test: MockTest) => void;
  unlocked: boolean;
  onOpenPricing: () => void;
}

export function NdaHub({ onOpenChapter, onOpenMockTest, unlocked, onOpenPricing }: NdaHubProps) {
  const mocks = MOCK_TESTS.filter((m) => m.exam === 'NDA');

  return (
    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1.6fr_1fr] animate-rise-in">
      <div className="flex flex-col gap-5.5">
        <div>
          <div className="text-xs font-semibold tracking-wide text-amber uppercase">NDA — Written Exam</div>
          <h2 className="font-heading text-3xl font-bold tracking-wide uppercase">Subjects &amp; Chapters</h2>
        </div>
        {NDA_SUBJECTS.map((subj) => {
          const completed = subj.chapters.filter((c) => c.pct >= 60).length;
          return (
            <div key={subj.name}>
              <div className="mb-2.5 flex items-baseline justify-between">
                <div className="font-heading text-[17px] font-bold tracking-wide uppercase">{subj.name}</div>
                <div className="text-xs text-muted">
                  {completed}/{subj.chapters.length} chapters
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {subj.chapters.map((ch) => (
                  <div
                    key={ch.name}
                    onClick={() => onOpenChapter(subj.name, ch.name)}
                    className="bg-bg-panel border border-border flex cursor-pointer items-center gap-3 px-4 py-3"
                  >
                    <div
                      className={`bg-bg-panel-2 border border-border font-heading flex h-8.5 w-8.5 flex-none items-center justify-center text-[13px] font-bold ${pctColor(ch.pct)}`}
                    >
                      {ch.pct}%
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{ch.name}</div>
                      <div className="bg-bg-panel-2 mt-1.5 h-[3px]">
                        <div className="h-full bg-amber" style={{ width: `${ch.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4.5">
        <div className="bg-bg-panel border border-border border-l-4 border-l-amber px-4.5 py-4">
          <div className="font-heading mb-2.5 text-sm font-bold tracking-wide uppercase">Daily Streak</div>
          <div className="font-heading text-2xl font-bold text-amber">12 Days</div>
          <div className="mt-2.5 flex gap-1">
            {STREAK_DAYS.map((v, i) => (
              <div key={i} className={`h-3.5 w-3.5 ${v ? 'bg-amber' : 'bg-bg-panel-2'}`} />
            ))}
          </div>
        </div>

        <div className="bg-bg-panel border border-border px-4.5 py-4">
          <div className="font-heading mb-3 text-sm font-bold tracking-wide uppercase">Mock Tests</div>
          <div className="flex flex-col gap-2">
            {mocks.map((m) => (
              <button
                key={m.id}
                onClick={() => onOpenMockTest(m)}
                className="bg-bg-panel-2 border border-border flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-left text-[13px]"
              >
                {m.name}
                <span className="text-[11px] text-muted">{m.meta}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bg-panel border border-border px-4.5 py-4">
          <CurrentAffairsDigest posts={DIGEST_POSTS} unlocked={unlocked} onOpenPricing={onOpenPricing} />
        </div>
      </div>
    </div>
  );
}
