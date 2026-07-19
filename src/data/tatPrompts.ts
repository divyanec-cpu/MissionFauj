/** TAT normally shows an ambiguous photograph; since no external images are
 * used here, each prompt is a short neutral scene description rendered in a
 * placeholder panel — enough ambiguity to write a story against. */
export interface TatPrompt {
  caption: string;
}

export const TAT_PROMPTS: TatPrompt[] = [
  { caption: 'A lone figure stands at the edge of a bridge, looking out over a wide river at dusk.' },
  { caption: 'Two people sit across a table in a dim office, papers spread between them.' },
  { caption: 'A group of climbers pauses partway up a steep, cloud-covered ridge.' },
  { caption: 'A blank slide with nothing on it — write a story of your own choosing.' },
];

export const TAT_OLQ_TAGS = ['Effective Intelligence', 'Power of Expression', 'Determination', 'Social Adaptability'];
