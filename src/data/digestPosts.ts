export interface DigestPost {
  date: string;
  title: string;
  detail: string;
}

export const DIGEST_POSTS: DigestPost[] = [
  {
    date: 'Jul 18',
    title: 'India-France joint naval exercise Varuna concludes off Goa coast.',
    detail:
      'The bilateral exercise focused on anti-submarine warfare, air-defence drills and cross-deck helicopter operations, reinforcing the two navies\' long-running interoperability track.',
  },
  {
    date: 'Jul 15',
    title: 'DRDO conducts successful trial of indigenous hypersonic test vehicle.',
    detail:
      'The Defence Research and Development Organisation validated aerodynamic and thermal-management performance at hypersonic speeds — a step toward domestically developed long-range strike capability.',
  },
  {
    date: 'Jul 11',
    title: 'New Chief of Defence Staff outlines theaterisation roadmap.',
    detail:
      'The roadmap proposes integrated theatre commands spanning the Army, Navy and Air Force, aimed at unifying command structures for faster joint decision-making.',
  },
];
