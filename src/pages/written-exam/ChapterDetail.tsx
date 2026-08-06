import { QUADRATIC_EQUATIONS_CONTENT } from '../../data/ndaChapters';
import { useAppState } from '../../context/AppStateContext';
import { chapterKey } from '../../types/progress';

interface ChapterDetailProps {
  exam: string;
  subject: string;
  chapter: string;
  onPracticeQuestions: () => void;
}

export function ChapterDetail({ exam, subject, chapter, onPracticeQuestions }: ChapterDetailProps) {
  const { progress, toggleChapterComplete } = useAppState();
  const hasFullContent = chapter === 'Quadratic Equations';
  const content = hasFullContent ? QUADRATIC_EQUATIONS_CONTENT : null;

  // Completion is the candidate's own claim, deliberately. The app cannot
  // observe whether someone understood a chapter, and inferring it from time
  // spent or questions opened would be a guess presented as fact.
  const key = chapterKey(exam, subject, chapter);
  const done = progress.completedChapters.includes(key);

  return (
    <div className="max-w-2xl animate-rise-in">
      <div className="mb-2 text-xs text-muted">
        {exam} / {subject} / <span className="text-khaki">{chapter}</span>
      </div>
      <h2 className="font-heading mb-5 text-3xl font-bold tracking-wide uppercase">{chapter}</h2>

      {content ? (
        <div className="flex flex-col gap-5 text-[15px] leading-relaxed text-khaki">
          <div>
            <div className="font-heading mb-1.5 text-sm font-bold tracking-wide text-amber uppercase">Definition</div>
            <p className="m-0">{content.definition}</p>
          </div>
          <div>
            <div className="font-heading mb-1.5 text-sm font-bold tracking-wide text-amber uppercase">
              Nature of Roots
            </div>
            <p className="m-0">{content.natureOfRoots}</p>
          </div>
          <div className="bg-bg-panel border border-border border-l-4 border-l-amber p-4.5">
            <div className="font-heading mb-2 text-xs font-bold tracking-wide text-amber uppercase">Key Formulas</div>
            <div className="flex flex-col gap-1.5 text-sm">
              {content.formulas.map((f) => (
                <div key={f}>{f}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-heading mb-1.5 text-sm font-bold tracking-wide text-amber uppercase">
              Solved Example
            </div>
            <p className="m-0">{content.solvedExample}</p>
          </div>
        </div>
      ) : (
        <p className="text-[15px] leading-relaxed text-muted">
          Full chapter notes for <span className="text-khaki">{chapter}</span> are being authored. Practice
          questions are available now to get started.
        </p>
      )}

      <div className="mt-6.5 flex flex-wrap items-center gap-3.5">
        <button
          type="button"
          onClick={onPracticeQuestions}
          className="font-heading cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
        >
          Practice Questions →
        </button>
        <button
          type="button"
          onClick={() => toggleChapterComplete(key)}
          aria-pressed={done}
          className={
            done
              ? 'font-heading cursor-pointer border border-eligible bg-transparent px-6 py-3.5 text-sm font-semibold tracking-wide text-eligible uppercase'
              : 'font-heading cursor-pointer border border-border bg-transparent px-6 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase'
          }
        >
          {done ? '✓ Completed' : 'Mark as Complete'}
        </button>
      </div>
      {done && (
        <div className="mt-2.5 text-[12px] text-muted">
          Counted towards this subject's progress. Tap again if you want to revisit it.
        </div>
      )}
    </div>
  );
}
