export interface SelfDescriptionPrompt {
  perspective: string;
  prompt: string;
}

export const SELF_DESCRIPTION_PROMPTS: SelfDescriptionPrompt[] = [
  { perspective: 'Your own opinion of yourself', prompt: 'What do you think of yourself?' },
  { perspective: "Your parents' opinion", prompt: 'What do your parents think of you?' },
  { perspective: "Your friends' opinion", prompt: 'What do your friends think of you?' },
  { perspective: "Your teachers'/employer's opinion", prompt: 'What do your teachers or employer think of you?' },
  { perspective: 'What you want to change', prompt: 'What would you like to change about yourself?' },
];

export const SELF_DESCRIPTION_OLQ_TAGS = ['Effective Intelligence', 'Self Confidence', 'Social Adaptability'];
