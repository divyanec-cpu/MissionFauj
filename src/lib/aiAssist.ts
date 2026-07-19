/**
 * Canned response generators for the two AI Assist surfaces. Both are
 * explanatory/coaching only — neither ever returns a score or a verdict.
 */
export function ssbAssistantReply(_question: string): string {
  return "Good question. Think in terms of the situation, your action and the outcome — that structure reads clearly to an assessor. This explains the approach; the actual response is always yours to write and self-review.";
}

export function digestAssistReply(_question: string): string {
  return "Here's the context behind that brief: look at who the stakeholders are, what changed recently, and how it connects to a broader current-affairs theme examiners tend to link questions across. Worth reading the original notification or a follow-up report for the full picture.";
}
