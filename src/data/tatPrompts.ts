/** TAT normally shows an ambiguous photograph; since no external images are
 * used here, each prompt is a short neutral scene description rendered in a
 * placeholder panel — enough ambiguity to write a story against. */
export interface TatPrompt {
  caption: string;
  /** The real TAT ends on a blank slide. Marked here rather than inferred from
   * position, so reordering or adding prompts can't move it onto a described
   * scene — which is exactly what happened when the art picked it by index. */
  blank?: boolean;
}

export const TAT_PROMPTS: TatPrompt[] = [
  { caption: 'A lone figure stands at the edge of a bridge, looking out over a wide river at dusk.' },
  { caption: 'Two people sit across a table in a dim office, papers spread between them.' },
  { caption: 'A group of climbers pauses partway up a steep, cloud-covered ridge.' },
  { caption: 'A young person sits alone on a hostel bed, a packed suitcase open beside them.' },
  { caption: 'A worker stands at the base of a tall crane, looking up at scaffolding under construction.' },
  { caption: 'A figure leans against a hospital corridor wall, head down, as a nurse walks past.' },
  { caption: 'Two colleagues stand on a factory floor, one pointing toward a stalled assembly line.' },
  { caption: 'A person stands at a village well at dawn, an empty pot beside them.' },
  { caption: 'A figure sits at a desk covered in books, staring at a clock on the wall.' },
  { caption: 'A soldier stands at the edge of a parade ground, watching a formation march past.' },
  { caption: 'A family gathers around a kitchen table, an unopened letter placed at its centre.' },
  { caption: 'A blank slide with nothing on it — write a story of your own choosing.', blank: true },
];

export const TAT_OLQ_TAGS = ['Effective Intelligence', 'Power of Expression', 'Determination', 'Social Adaptability'];
