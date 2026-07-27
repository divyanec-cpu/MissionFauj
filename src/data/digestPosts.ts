export interface DigestPost {
  date: string;
  title: string;
  detail: string;
  sourceName: string;
  sourceUrl: string;
}

// Real, dated events — each carries its source so a candidate can verify
// the facts themselves rather than trust a summary blindly. This list
// needs periodic manual refresh; it is not a live feed.
export const DIGEST_POSTS: DigestPost[] = [
  {
    date: 'Jul 13',
    title: 'Tamil poet R. Vairamuthu conferred the 60th Jnanpith Award.',
    detail:
      "India's highest literary honour was presented at a ceremony in New Delhi. Vairamuthu is the third Tamil writer, and the first Tamil poet, to receive the award — recognising over 40 literary works alongside his film lyrics.",
    sourceName: 'The Statesman',
    sourceUrl: 'https://www.magzter.com/stories/newspaper/The-Statesman-Kolkata/TAMIL-POET-AND-LYRICIST-R-VAIRAMUTHU-RECEIVES-60TH-JNANPITH-AWARD',
  },
  {
    date: 'Jul 22',
    title: "DRDO's GTRE receives India's first indigenous expendable turbojet engine.",
    detail:
      'Azad Engineering, Hyderabad handed over the 350 kg-thrust-class engine to the Gas Turbine Research Establishment — a step toward domestic engines for expendable aerial systems like target drones and loitering munitions.',
    sourceName: 'ANI News',
    sourceUrl: 'https://aninews.in/news/national/general-news/drdo-develops-indias-first-indigenous-350-kg-thrust-class-expendable-turbojet-engine20260723233246/',
  },
  {
    date: 'Jul 24',
    title: "DRDO flight-tests 'Kusha' long-range surface-to-air missile.",
    detail:
      'The maiden test intercepted a simulated high-speed aerial threat. Kusha is planned in three range tiers (120–150 km, 250 km, 400 km) for layered air defence, similar in concept to the S-400, under the Mission Sudarshan Chakra umbrella.',
    sourceName: 'Life of Soldiers',
    sourceUrl: 'https://www.lifeofsoldiers.com/2026/07/24/drdo-conducts-successful-maiden-flight-test-of-kusha-long-range-surface-to-air-missile',
  },
  {
    date: 'Jul 26',
    title: '27th Kargil Vijay Diwas observed nationwide.',
    detail:
      'India marked 27 years since the 1999 Kargil War victory, when Indian forces recaptured strategic heights along the Line of Control. The Raksha Mantri reaffirmed the armed forces\' operational readiness on the eve of the anniversary.',
    sourceName: 'Life of Soldiers',
    sourceUrl: 'https://www.lifeofsoldiers.com/2026/07/27/indian-defence-forces-stand-fully-prepared-to-face-any-challenge-says-raksha-mantri-on-the-eve-of-kargil-vijay-diwas-2026',
  },
  {
    date: 'Jul 27',
    title: "Rishikanta Singh Chanambam wins India's first medal at CWG 2026.",
    detail:
      "The Indian Army weightlifter took silver in the men's 60 kg category at the Glasgow Commonwealth Games, setting a new Games record in the snatch with a 121 kg lift and finishing on a combined total of 264 kg.",
    sourceName: 'Glasgow 2026',
    sourceUrl: 'https://www.glasgow2026.com/news/4546923/rishikanta-singh-chanambam-brings-india-their-first-silver-medal-of-games-with-new-commonwealth-record',
  },
];
