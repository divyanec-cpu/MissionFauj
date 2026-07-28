import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppState } from '../../context/AppStateContext';

interface AppHeaderProps {
  pageLabel: string;
  right?: ReactNode;
}

export function AppHeader({ pageLabel, right }: AppHeaderProps) {
  const appState = useAppState();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-8 lg:px-14">
      <div className="flex flex-wrap items-baseline gap-3">
        <Link to="/" className="font-heading text-xl font-bold tracking-wider text-ink no-underline">
          MISSION<span className="text-amber">FAUJ</span>
        </Link>
        <span className="text-[11px] uppercase tracking-wider text-muted">{pageLabel}</span>
        <div className="flex flex-none items-center gap-2">
          <Link
            to="/eligibility-check"
            className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
          >
            Eligibility Check
          </Link>
          <Link
            to="/help"
            className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
          >
            Help
          </Link>
          <Link
            to="/glossary"
            className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
          >
            Glossary
          </Link>
          {appState.auth && (
            <Link
              to="/profile"
              className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
            >
              Profile
            </Link>
          )}
        </div>
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </header>
  );
}
