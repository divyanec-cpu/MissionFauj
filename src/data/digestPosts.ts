export interface DigestPost {
  date: string;
  title: string;
  detail: string;
}

// Deliberately empty — this held fabricated "current affairs" events
// presented as real dated news, which is misleading regardless of intent.
// Populate with genuinely sourced, dated current-affairs briefs when real
// editorial content is available.
export const DIGEST_POSTS: DigestPost[] = [];
