const FIGURE = (x: number, khaki = true) => (
  <g key={x} transform={`translate(${x} 0)`}>
    <circle cx="0" cy="0" r="6" className={khaki ? 'fill-khaki' : 'fill-steel'} />
    <polygon points="-8,10 8,10 5,34 -5,34" className={khaki ? 'fill-khaki' : 'fill-steel'} />
  </g>
);

/**
 * Abstract, deliberately ambiguous geometric scenes standing in for a TAT/PPDT
 * photograph — no external images, but a real illustration rather than bare text.
 *
 * Every shape is defined by a visible STROKE; fills are decoration only. The
 * earlier version drew its scenery with `stroke-border` and a `fill-bg-panel`
 * ground plane over a `bg-bg-panel-2` card, measuring 1.40 and 1.06 contrast —
 * the second being the background colour painted onto itself. Only the khaki
 * figures cleared any threshold, so candidates saw stick figures floating in an
 * empty box and reported the pictures as missing. Fills cannot carry these
 * shapes at this palette (steel at 50% opacity still only reaches 2.42), which
 * is why the scenery is outlined rather than filled. Keep it that way.
 */
function SceneArt({ variant }: { variant: number }) {
  // Four real scenes. The empty frame is NOT one of them — see BlankScene.
  switch (variant % 4) {
    case 0: // figure at a railing, looking out over a horizon
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <polygon points="0,90 90,90 110,70 220,70 220,90" className="fill-steel opacity-30" />
          <line x1="0" y1="90" x2="220" y2="90" className="stroke-steel" strokeWidth="2" />
          <line x1="60" y1="60" x2="150" y2="60" className="stroke-khaki" strokeWidth="3" />
          <line x1="60" y1="60" x2="60" y2="90" className="stroke-khaki" strokeWidth="3" />
          <line x1="150" y1="60" x2="150" y2="90" className="stroke-khaki" strokeWidth="3" />
          <g transform="translate(120 48)">{FIGURE(0)}</g>
        </svg>
      );
    case 1: // two seated figures across a table
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-steel" strokeWidth="2" />
          <polygon points="80,70 140,70 150,80 70,80" className="fill-none stroke-khaki" strokeWidth="2" />
          <g transform="translate(70 55)">{FIGURE(0)}</g>
          <g transform="translate(150 55)">{FIGURE(0, false)}</g>
        </svg>
      );
    case 2: // ridge line with small climbing figures
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <polygon points="0,95 50,45 90,75 130,30 170,60 220,40 220,95" className="fill-steel opacity-30" />
          <polyline
            points="0,95 50,45 90,75 130,30 170,60 220,40"
            className="fill-none stroke-steel"
            strokeWidth="2"
          />
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-steel" strokeWidth="2" />
          <g transform="translate(95 60) scale(0.6)">{FIGURE(0)}</g>
          <g transform="translate(150 48) scale(0.6)">{FIGURE(0, false)}</g>
        </svg>
      );
    default: // people gathered near a stalled vehicle
      return (
        <svg viewBox="0 0 220 130" className="h-28 w-full">
          <line x1="0" y1="95" x2="220" y2="95" className="stroke-steel" strokeWidth="2" />
          <rect x="85" y="62" width="60" height="24" className="fill-none stroke-khaki" strokeWidth="2" />
          <circle cx="98" cy="88" r="7" className="fill-none stroke-khaki" strokeWidth="2" />
          <circle cx="132" cy="88" r="7" className="fill-none stroke-khaki" strokeWidth="2" />
          <g transform="translate(60 58) scale(0.7)">{FIGURE(0)}</g>
          <g transform="translate(160 55) scale(0.7)">{FIGURE(0, false)}</g>
          <g transform="translate(175 60) scale(0.6)">{FIGURE(0)}</g>
        </svg>
      );
  }
}

/** Shown only for a prompt that is genuinely blank by design. */
function BlankScene() {
  return (
    <svg viewBox="0 0 220 130" className="h-28 w-full">
      <rect
        x="20"
        y="20"
        width="180"
        height="90"
        strokeDasharray="6 6"
        className="fill-none stroke-steel"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * `blank` comes from the prompt itself, never from the index. Choosing the empty
 * frame with `variant % 5` put it on four described scenes — a crane, a parade
 * ground, a campfire — while the one prompt that really is a blank slide got a
 * picture of two people at a table: the exact inverse of the intent.
 */
export function ScenePlaceholder({
  variant,
  caption,
  blank = false,
}: {
  variant: number;
  caption: string;
  blank?: boolean;
}) {
  return (
    <div className="bg-bg-panel-2 border border-border flex flex-col gap-3 px-6 py-5">
      <div className="text-[10px] tracking-wide text-muted uppercase">Illustrative Scene — Not a Photograph</div>
      {blank ? <BlankScene /> : <SceneArt variant={variant} />}
      <div className="border-t border-border pt-3 text-[13px] leading-relaxed text-khaki italic">"{caption}"</div>
    </div>
  );
}
