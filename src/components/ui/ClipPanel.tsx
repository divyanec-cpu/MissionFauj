import type { MouseEventHandler, ReactNode } from 'react';

type Accent = 'amber' | 'steel' | 'eligible' | 'not-eligible' | 'none';

interface ClipPanelProps {
  children: ReactNode;
  accent?: Accent;
  accentSide?: 'left' | 'top' | 'full';
  clip?: 'card' | 'panel' | 'none';
  faded?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const ACCENT_LEFT: Record<Accent, string> = {
  amber: 'border-l-amber',
  steel: 'border-l-steel',
  eligible: 'border-l-eligible',
  'not-eligible': 'border-l-not-eligible',
  none: '',
};

const ACCENT_TOP: Record<Accent, string> = {
  amber: 'border-t-amber',
  steel: 'border-t-steel',
  eligible: 'border-t-eligible',
  'not-eligible': 'border-t-not-eligible',
  none: '',
};

const ACCENT_FULL: Record<Accent, string> = {
  amber: 'border-amber',
  steel: 'border-steel',
  eligible: 'border-eligible',
  'not-eligible': 'border-not-eligible',
  none: '',
};

export function ClipPanel({
  children,
  accent = 'none',
  accentSide = 'left',
  clip = 'card',
  faded = false,
  className = '',
  onClick,
}: ClipPanelProps) {
  const clipClass = clip === 'card' ? 'clip-card' : clip === 'panel' ? 'clip-panel' : '';

  let sideClass = 'border border-border';
  if (accent !== 'none') {
    if (accentSide === 'left') sideClass = `border border-border border-l-4 ${ACCENT_LEFT[accent]}`;
    else if (accentSide === 'top') sideClass = `border border-border border-t-4 ${ACCENT_TOP[accent]}`;
    else sideClass = `border ${ACCENT_FULL[accent]}`;
  }

  return (
    <div
      onClick={onClick}
      className={`bg-bg-panel ${sideClass} ${clipClass} ${faded ? 'opacity-70' : ''} p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
