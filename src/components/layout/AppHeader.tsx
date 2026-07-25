import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppState } from '../../context/AppStateContext';

interface AppHeaderProps {
  pageLabel: string;
  right?: ReactNode;
}

function maskPhone(phone: string) {
  return phone ? 'XXXXX' + phone.slice(-4) : '';
}

export function AppHeader({ pageLabel, right }: AppHeaderProps) {
  const appState = useAppState();
  const navigate = useNavigate();

  const handleSignOut = () => {
    appState.signOut();
    navigate('/');
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-8 lg:px-14">
      <div className="flex flex-wrap items-baseline gap-3">
        <Link to="/" className="font-heading text-xl font-bold tracking-wider text-ink no-underline">
          MISSION<span className="text-amber">FAUJ</span>
        </Link>
        <span className="text-[11px] uppercase tracking-wider text-muted">{pageLabel}</span>
        <div className="flex flex-none items-center gap-2">
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
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {right}
        {appState.auth && (
          <>
            <span className="text-[11px] text-muted">+91 {maskPhone(appState.auth.candidatePhone)}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="cursor-pointer border border-border bg-transparent px-2.5 py-1 text-[11px] text-muted hover:text-ink"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
