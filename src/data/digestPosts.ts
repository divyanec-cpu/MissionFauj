export interface DigestPost {
  date: string;
  title: string;
  detail: string;
  sourceName: string;
  sourceUrl: string;
}

// Actual posts are admin-editable (server/src/routes/admin/digestPosts.ts)
// and fetched at runtime via src/lib/contentApi.ts's fetchDigestPosts().
