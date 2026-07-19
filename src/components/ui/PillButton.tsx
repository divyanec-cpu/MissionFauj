import type { ReactNode } from 'react';

interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export function PillButton({ active, onClick, children, size = 'md' }: PillButtonProps) {
  const padding = size === 'sm' ? 'px-4 py-2 text-xs' : 'px-4.5 py-2.5 text-[13px]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-heading ${padding} cursor-pointer border font-semibold tracking-wide uppercase transition-colors ${
        active ? 'border-amber bg-amber text-[#1b1500]' : 'border-border bg-bg-panel text-ink hover:border-khaki'
      }`}
    >
      {children}
    </button>
  );
}
