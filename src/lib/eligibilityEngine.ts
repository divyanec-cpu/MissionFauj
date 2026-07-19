import type { CandidateProfile } from '../types/profile';
import type { FailCheck, SchemeResult, SchemeRule } from '../types/schemes';

function failReasonFor(check: FailCheck | undefined, rule: SchemeRule, profile: CandidateProfile): string {
  switch (check) {
    case 'pcm':
      return `Requires 12th with ${rule.pcmLabel ?? 'Physics & Mathematics'}.`;
    case 'education':
      return rule.education === '12th'
        ? 'Requires Class 12 pass or appearing.'
        : 'Requires a graduate degree (or final year).';
    case 'marital':
      return 'Requires unmarried status.';
    case 'ncc':
      return 'Requires a Senior Division NCC "C" Certificate.';
    case 'age':
    default:
      return `Age window is ${rule.ageMin}–${rule.ageMax}; you are ${profile.age}.`;
  }
}

/**
 * Evaluates one candidate profile against the full rule table. One shared
 * evaluator for every scheme — only the rule table (data) changes when a
 * year's notification changes, not this logic.
 */
export function evaluateSchemes(profile: CandidateProfile, rules: SchemeRule[]): SchemeResult[] {
  const is12th = profile.education.startsWith('Class 12');
  const isGrad = profile.education.startsWith('Graduate') || profile.education === 'Postgraduate';
  const pcm = profile.stream === 'Science (PCM)';
  const unmarried = profile.marital === 'Unmarried';
  const nccCert = profile.ncc !== 'None';

  return rules.map((rule) => {
    const checks: Record<FailCheck, boolean> = {
      pcm: !rule.requiresPCM || pcm,
      education: rule.education === '12th' ? is12th : isGrad,
      age: profile.age >= rule.ageMin && profile.age <= rule.ageMax,
      marital: rule.marital === 'any' || unmarried,
      ncc: !rule.requiresNCC || nccCert,
    };
    const eligible = Object.values(checks).every(Boolean);
    const failedCheck = rule.failPriority.find((check) => !checks[check]);
    return {
      id: rule.id,
      name: rule.name,
      branch: rule.branch,
      eligible,
      reason: eligible ? rule.okReason : failReasonFor(failedCheck, rule, profile),
    };
  });
}
