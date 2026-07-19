const FIGURE = (x: number, khaki = true) => (
  <g key={x} transform={`translate(${x} 0)`}>
    <circle cx="0" cy="0" r="6" className={khaki ? 'fill-khaki' : 'fill-steel'} />
    <polygon points="-8,10 8,10 5,34 -5,34" className={khaki ? 'fill-khaki' : 'fill-steel'} />
  </g>
);

/** Abstract, deliberately ambiguous geometric scenes standing in for a TAT/PPDT
 * photograph — no external images, but a real illustration rather than bare text. */
function SceneArt({ variant }: { variant: number }) {
  switch (variant % 5) {
    case 0: // figure at a railing, looking out over a horizon
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <line x1="0" y1="90" x2="220" y2="90" className="stroke-border" strokeWidth="2" />
          <polygon points="0,90 90,90 110,70 220,70 220,90" className="fill-bg-panel opacity-60" />
          <line x1="60" y1="60" x2="150" y2="60" className="stroke-steel" strokeWidth="3" />
          <line x1="60" y1="60" x2="60" y2="90" className="stroke-steel" strokeWidth="3" />
          <line x1="150" y1="60" x2="150" y2="90" className="stroke-steel" strokeWidth="3" />
          <g transform="translate(120 48)">{FIGURE(0)}</g>
        </svg>
      );
    case 1: // two seated figures across a table
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-border" strokeWidth="2" />
          <polygon points="80,70 140,70 150,80 70,80" className="fill-steel opacity-70" />
          <g transform="translate(70 55)">{FIGURE(0)}</g>
          <g transform="translate(150 55)">{FIGURE(0, false)}</g>
        </svg>
      );
    case 2: // ridge line with small climbing figures
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <polygon points="0,95 50,45 90,75 130,30 170,60 220,40 220,95" className="fill-steel opacity-50" />
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-border" strokeWidth="2" />
          <g transform="translate(95 60) scale(0.6)">{FIGURE(0)}</g>
          <g transform="translate(150 48) scale(0.6)">{FIGURE(0, false)}</g>
        </svg>
      );
    case 3: // people gathered near a stalled vehicle
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-border" strokeWidth="2" />
          <rect x="85" y="62" width="60" height="24" className="fill-steel opacity-60" />
          <circle cx="98" cy="88" r="7" className="fill-bg-panel-2 stroke-steel" strokeWidth="2" />
          <circle cx="132" cy="88" r="7" className="fill-bg-panel-2 stroke-steel" strokeWidth="2" />
          <g transform="translate(60 58) scale(0.7)">{FIGURE(0)}</g>
          <g transform="translate(160 55) scale(0.7)">{FIGURE(0, false)}</g>
          <g transform="translate(175 60) scale(0.6)">{FIGURE(0)}</g>
        </svg>
      );
    default: // intentionally blank — candidate's own story
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-border" strokeWidth="2" />
          <line x1="20" y1="20" x2="200" y2="20" strokeDasharray="6 6" className="stroke-border" strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="95" strokeDasharray="6 6" className="stroke-border" strokeWidth="2" />
          <line x1="200" y1="20" x2="200" y2="95" strokeDasharray="6 6" className="stroke-border" strokeWidth="2" />
        </svg>
      );
  }
}

export function ScenePlaceholder({ variant, caption }: { variant: number; caption: string }) {
  return (
    <div className="bg-bg-panel-2 border border-border flex flex-col gap-3 px-6 py-5">
      <div className="text-[10px] tracking-wide text-muted uppercase">Illustrative Scene — Not a Photograph</div>
      <SceneArt variant={variant} />
      <div className="border-t border-border pt-3 text-[13px] leading-relaxed text-khaki italic">"{caption}"</div>
    </div>
  );
}
