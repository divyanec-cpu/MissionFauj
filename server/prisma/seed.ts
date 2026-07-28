// One-time content seed — run manually via `npx prisma db seed` after the
// migration is deployed (Render Shell in production). Each block is
// idempotent (skips if the table already has rows), so it's safe even if
// run again by accident, but it is NOT re-run automatically on every boot —
// once the admin panel is in use, this script should not silently overwrite
// their edits. Source data is the static frontend files this replaces:
// src/data/{experts,digestPosts,pricingPlans,eligibilityRules}.ts.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER = '— to be added —';

async function seedExperts() {
  if ((await prisma.expert.count()) > 0) return;
  await prisma.expert.createMany({
    data: [
      { role: 'Interviewing Officer', category: 'IO', accent: 'var(--color-amber)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER, sortOrder: 0 },
      { role: 'Group Testing Officer', category: 'GTO', accent: 'var(--color-steel)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER, sortOrder: 1 },
      { role: 'Psychologist', category: 'Psychologist', accent: 'var(--color-khaki)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER, sortOrder: 2 },
      { role: 'Board President', category: 'Board President', accent: 'var(--color-eligible)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER, sortOrder: 3 },
      { role: 'English & Confidence Coach', category: 'English & Confidence', accent: 'var(--color-eligible)', name: PLACEHOLDER, credentials: PLACEHOLDER, bio: PLACEHOLDER, price: PLACEHOLDER, bonus: true, sortOrder: 4 },
    ],
  });
  console.log('Seeded 5 experts.');
}

async function seedDigestPosts() {
  if ((await prisma.digestPost.count()) > 0) return;
  await prisma.digestPost.createMany({
    data: [
      {
        date: 'Jul 13',
        title: 'Tamil poet R. Vairamuthu conferred the 60th Jnanpith Award.',
        detail:
          "India's highest literary honour was presented at a ceremony in New Delhi. Vairamuthu is the third Tamil writer, and the first Tamil poet, to receive the award — recognising over 40 literary works alongside his film lyrics.",
        sourceName: 'The Statesman',
        sourceUrl: 'https://www.magzter.com/stories/newspaper/The-Statesman-Kolkata/TAMIL-POET-AND-LYRICIST-R-VAIRAMUTHU-RECEIVES-60TH-JNANPITH-AWARD',
        sortOrder: 0,
      },
      {
        date: 'Jul 22',
        title: "DRDO's GTRE receives India's first indigenous expendable turbojet engine.",
        detail:
          'Azad Engineering, Hyderabad handed over the 350 kg-thrust-class engine to the Gas Turbine Research Establishment — a step toward domestic engines for expendable aerial systems like target drones and loitering munitions.',
        sourceName: 'ANI News',
        sourceUrl: 'https://aninews.in/news/national/general-news/drdo-develops-indias-first-indigenous-350-kg-thrust-class-expendable-turbojet-engine20260723233246/',
        sortOrder: 1,
      },
      {
        date: 'Jul 24',
        title: "DRDO flight-tests 'Kusha' long-range surface-to-air missile.",
        detail:
          'The maiden test intercepted a simulated high-speed aerial threat. Kusha is planned in three range tiers (120–150 km, 250 km, 400 km) for layered air defence, similar in concept to the S-400, under the Mission Sudarshan Chakra umbrella.',
        sourceName: 'Life of Soldiers',
        sourceUrl: 'https://www.lifeofsoldiers.com/2026/07/24/drdo-conducts-successful-maiden-flight-test-of-kusha-long-range-surface-to-air-missile',
        sortOrder: 2,
      },
      {
        date: 'Jul 26',
        title: '27th Kargil Vijay Diwas observed nationwide.',
        detail:
          "India marked 27 years since the 1999 Kargil War victory, when Indian forces recaptured strategic heights along the Line of Control. The Raksha Mantri reaffirmed the armed forces' operational readiness on the eve of the anniversary.",
        sourceName: 'Life of Soldiers',
        sourceUrl: 'https://www.lifeofsoldiers.com/2026/07/27/indian-defence-forces-stand-fully-prepared-to-face-any-challenge-says-raksha-mantri-on-the-eve-of-kargil-vijay-diwas-2026',
        sortOrder: 3,
      },
      {
        date: 'Jul 27',
        title: "Rishikanta Singh Chanambam wins India's first medal at CWG 2026.",
        detail:
          "The Indian Army weightlifter took silver in the men's 60 kg category at the Glasgow Commonwealth Games, setting a new Games record in the snatch with a 121 kg lift and finishing on a combined total of 264 kg.",
        sourceName: 'Glasgow 2026',
        sourceUrl: 'https://www.glasgow2026.com/news/4546923/rishikanta-singh-chanambam-brings-india-their-first-silver-medal-of-games-with-new-commonwealth-record',
        sortOrder: 4,
      },
    ],
  });
  console.log('Seeded 5 digest posts.');
}

async function seedPricingPlans() {
  if ((await prisma.pricingPlan.count()) > 0) return;
  await prisma.pricingPlan.createMany({
    data: [
      {
        scope: 'written',
        name: 'Monthly',
        price: '₹499',
        period: 'per month',
        perks: ['Written exam prep', 'Full-length & sectional mocks', 'Current-affairs digest'],
        sortOrder: 0,
      },
      {
        scope: 'written',
        name: 'Quarterly',
        price: '₹1,199',
        period: 'per quarter · ₹400/mo',
        highlighted: true,
        badge: 'Most Popular',
        perks: ['Everything in Monthly', 'SSB practice, all schemes', 'OLQ self-assessment'],
        sortOrder: 1,
      },
      {
        scope: 'written',
        name: 'Till Exam Day',
        price: '₹1,999',
        period: 'one-time, valid till result',
        perks: ['Everything in Quarterly', 'Locked-in access through your exam cycle'],
        sortOrder: 2,
      },
      {
        scope: 'ssb',
        name: 'SSB Training',
        price: '₹899',
        priceValue: 899,
        period: 'one-time module access',
        perks: ['Full SSB training module access', 'Psychology, GTO, and Interview practice', 'Self-review, never AI-scored'],
        sortOrder: 0,
      },
    ],
  });
  console.log('Seeded 4 pricing plans.');
}

async function seedEligibilityRules() {
  if ((await prisma.eligibilityRule.count()) > 0) return;
  await prisma.eligibilityRule.createMany({
    data: [
      { id: 'nda-army', name: 'NDA — Army Wing', branch: 'Indian Army', ageMin: 16.5, ageMax: 19.5, education: '12th', marital: 'unmarried', failPriority: ['marital', 'age', 'education'], okReason: 'Age 16.5–19.5, 12th pass/appearing, unmarried — all met.', sortOrder: 0 },
      { id: 'nda-navy', name: 'NDA — Naval Wing', branch: 'Indian Navy', ageMin: 16.5, ageMax: 19.5, education: '12th', requiresPCM: true, pcmLabel: 'Physics & Mathematics', marital: 'unmarried', failPriority: ['pcm', 'age', 'marital'], okReason: 'Age, 12th with Physics & Maths, and unmarried status all met.', sortOrder: 1 },
      { id: 'nda-af', name: 'NDA — Air Force Wing', branch: 'Indian Air Force', ageMin: 16.5, ageMax: 19.5, education: '12th', requiresPCM: true, pcmLabel: 'Physics, Chemistry & Mathematics', marital: 'unmarried', failPriority: ['pcm', 'age', 'marital'], okReason: 'Age, 12th PCM, and unmarried status all met.', sortOrder: 2 },
      { id: 'naval-academy', name: 'Naval Academy — 10+2 (B.Tech)', branch: 'Indian Navy · Executive Branch', ageMin: 16.5, ageMax: 19.5, education: '12th', requiresPCM: true, pcmLabel: 'Physics & Mathematics', marital: 'unmarried', failPriority: ['pcm', 'age', 'marital'], okReason: 'Age, 12th with Physics & Maths, and unmarried status all met. Same NDA/NA written exam, 4-yr B.Tech track.', sortOrder: 3 },
      { id: 'cds-ima', name: 'CDS — IMA', branch: 'Indian Military Academy', ageMin: 19, ageMax: 24, education: 'graduate', marital: 'unmarried', failPriority: ['education', 'age', 'marital'], okReason: 'Age 19–24, graduate, unmarried — all met.', sortOrder: 4 },
      { id: 'cds-ina', name: 'CDS — INA', branch: 'Indian Naval Academy', ageMin: 19, ageMax: 24, education: 'graduate', marital: 'unmarried', failPriority: ['education', 'age', 'marital'], okReason: 'Age 19–24, graduate, unmarried — all met.', sortOrder: 5 },
      { id: 'cds-afa', name: 'CDS — AFA', branch: 'Air Force Academy', ageMin: 19, ageMax: 24, education: 'graduate', requiresPCM: true, pcmLabel: 'Physics & Mathematics', marital: 'unmarried', failPriority: ['pcm', 'education', 'age', 'marital'], okReason: 'Age 19–24, graduate with 12th PCM, unmarried — all met.', sortOrder: 6 },
      { id: 'cds-ota', name: 'CDS — OTA (Non-Tech)', branch: 'Officers Training Academy', ageMin: 19, ageMax: 25, education: 'graduate', marital: 'any', failPriority: ['education', 'age'], okReason: 'Age 19–25 and graduate — all met. Open to men and women.', sortOrder: 7 },
      { id: 'afcat-flying', name: 'AFCAT — Flying Branch', branch: 'Indian Air Force', ageMin: 20, ageMax: 24, education: 'graduate', requiresPCM: true, pcmLabel: 'Physics & Mathematics', marital: 'any', failPriority: ['pcm', 'education', 'age'], okReason: 'Age 20–24, graduate with 12th PCM — all met.', sortOrder: 8 },
      { id: 'afcat-ground', name: 'AFCAT — Ground Duty (Tech)', branch: 'Indian Air Force', ageMin: 20, ageMax: 26, education: 'graduate', marital: 'any', failPriority: ['education', 'age'], okReason: 'Age 20–26 and graduate (engineering-relevant) — all met.', sortOrder: 9 },
      { id: 'tes', name: 'TES — Technical Entry', branch: 'Indian Army', ageMin: 16.5, ageMax: 19.5, education: '12th', requiresPCM: true, pcmLabel: 'Physics, Chemistry & Mathematics', marital: 'any', failPriority: ['pcm', 'age'], okReason: 'Age 16.5–19.5 with 12th PCM — all met.', sortOrder: 10 },
      { id: 'ncc-special-entry', name: 'NCC Special Entry', branch: 'Army / Navy / Air Force', ageMin: 19, ageMax: 24, education: 'graduate', requiresNCC: true, marital: 'any', failPriority: ['ncc', 'education', 'age'], okReason: 'Age 19–24, graduate, with a Senior Division "C" Certificate — all met.', sortOrder: 11 },
      { id: 'territorial-army', name: 'Territorial Army', branch: 'Territorial Army', ageMin: 18, ageMax: 42, education: 'graduate', marital: 'any', failPriority: ['education', 'age'], okReason: 'Age 18–42 and graduate, alongside civilian employment — all met.', sortOrder: 12 },
    ],
  });
  console.log('Seeded 13 eligibility rules.');
}

async function main() {
  await seedExperts();
  await seedDigestPosts();
  await seedPricingPlans();
  await seedEligibilityRules();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
