import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { GLOSSARY_GROUPS } from '../data/glossary';

export function GlossaryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        pageLabel="Glossary"
        right={
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink">
              Eligibility
            </Link>
            <Link
              to="/written-exam-prep"
              className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
            >
              Written Prep
            </Link>
            <Link
              to="/ssb-training"
              className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
            >
              SSB Training
            </Link>
          </div>
        }
      />

      <main className="max-w-3xl px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <h1 className="font-heading mb-1.5 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          Terms &amp; Abbreviations
        </h1>
        <p className="mb-7 text-sm text-muted">Every short form used across MissionFauj, spelled out in full.</p>

        {GLOSSARY_GROUPS.map((g) => (
          <div key={g.title} className="mb-7.5">
            <div className="font-heading mb-3 text-sm font-bold tracking-wide text-amber uppercase">{g.title}</div>
            <div className="flex flex-col">
              {g.terms.map((t) => (
                <div key={t.abbr} className="flex gap-4 border-b border-border py-3 items-baseline">
                  <div className="font-heading min-w-[110px] flex-none text-[15px] font-bold text-khaki">{t.abbr}</div>
                  <div className="text-[13px]">{t.full}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
