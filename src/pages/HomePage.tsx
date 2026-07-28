import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { ClipPanel } from '../components/ui/ClipPanel';
import { PillButton } from '../components/ui/PillButton';
import { useAppState } from '../context/AppStateContext';
import { CANDIDATE_PATH_INFO, type CandidatePath } from '../types/candidatePath';

const PATH_ORDER: CandidatePath[] = ['school', 'graduate', 'ssb-only'];

// Primary (emphasized) vs secondary destination per path — school/graduate
// lead with Written Exam Prep, ssb-only leads with SSB Training. Neither is
// ever hidden: every path can reach both in one tap.
function primaryDestination(path: CandidatePath): 'written' | 'ssb' {
  return path === 'ssb-only' ? 'ssb' : 'written';
}

export function HomePage() {
  const appState = useAppState();
  const path = appState.candidatePath ?? 'ssb-only';
  const primary = primaryDestination(path);

  const emphasized = 'font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase no-underline';
  const secondary = 'font-heading cursor-pointer border border-border bg-transparent px-7.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase no-underline';

  const writtenCta = (
    <Link to="/written-exam-prep" className={primary === 'written' ? emphasized : secondary}>
      Written Exam Prep →
    </Link>
  );
  const ssbCta = (
    <Link to="/ssb-training" className={primary === 'ssb' ? emphasized : secondary}>
      SSB Training →
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader pageLabel="Home" />

      <main className="flex max-w-2xl flex-col gap-8 px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div>
          <div className="text-xs font-semibold tracking-wide text-amber uppercase">{CANDIDATE_PATH_INFO[path].label}</div>
          <h1 className="font-heading mb-1.5 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
            Welcome Back{appState.candidateName ? `, ${appState.candidateName}` : ''}
          </h1>
          <p className="text-sm text-muted">{CANDIDATE_PATH_INFO[path].description}</p>
        </div>

        {!appState.eligibilityResults && (
          <ClipPanel accent="amber">
            <div className="flex flex-col gap-2.5">
              <div className="font-heading font-semibold text-ink">Haven't Checked Your Eligibility Yet?</div>
              <p className="text-[12px] text-muted">
                See exactly which entry schemes you qualify for — takes about 2 minutes, and never blocks your prep
                either way.
              </p>
              <Link
                to="/eligibility-check"
                className="font-heading self-start text-[12px] font-bold tracking-wide text-amber uppercase no-underline"
              >
                Take the Test →
              </Link>
            </div>
          </ClipPanel>
        )}

        <section>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">Continue Your Prep</div>
          <div className="flex flex-wrap gap-3.5">
            {primary === 'written' ? (
              <>
                {writtenCta}
                {ssbCta}
              </>
            ) : (
              <>
                {ssbCta}
                {writtenCta}
              </>
            )}
          </div>
        </section>

        <section>
          <ClipPanel accent="steel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-heading font-semibold text-ink">Want Direct Feedback?</div>
                <p className="text-[12px] text-muted">Book time with a retired IO, GTO, Psychologist or Board President.</p>
              </div>
              <Link to="/expert-consultation" className="text-[12px] font-semibold text-amber uppercase no-underline">
                Book →
              </Link>
            </div>
          </ClipPanel>
        </section>

        <section>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">Change Your Path</div>
          <div className="flex flex-wrap gap-2.5">
            {PATH_ORDER.map((p) => (
              <PillButton key={p} active={path === p} onClick={() => appState.changePath(p)}>
                {CANDIDATE_PATH_INFO[p].label}
              </PillButton>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
