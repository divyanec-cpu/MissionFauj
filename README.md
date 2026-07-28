# MissionFauj

Exam-prep and SSB-training app for Indian defence-services aspirants (NDA, CDS, AFCAT, and other officer-entry schemes). React + TypeScript + Vite + Tailwind CSS, wrapped as an Android app via Capacitor.

Full documentation: [`docs/TECHNICAL_BRIEF.md`](docs/TECHNICAL_BRIEF.md) (architecture, data model, why things are built the way they are) and [`docs/FUNCTIONAL_SPEC.md`](docs/FUNCTIONAL_SPEC.md) (screens, flows, content rules) — kept up to date as the app develops.

## Architecture

- **Frontend** (this repo's `src/`): deployed to Vercel at [missionfauj.vercel.app](https://missionfauj.vercel.app). The Vercel↔GitHub connection is authorized, so pushing to `main` auto-deploys — `vercel --prod` also works for a manual deploy.
- **Backend** (`server/`): Express + Prisma + Postgres, handles session tokens and the versioned DPDP consent record. Deployed to Render (`missionfauj-otp-server`) via `render.yaml`. OTP send/verify itself happens client-side against MSG91 directly (see `src/lib/msg91Client.ts`) — Render's outbound IP gets intermittently blocked by MSG91's widget anti-abuse layer, so the backend never calls MSG91 itself.
- **Android app**: a thin Capacitor shell (`capacitor.config.ts`'s `server.url`) pointing at the live Vercel deployment, not a bundled build. Deploying the web app updates every installed copy on next open — no APK rebuild needed unless the app icon, name, or the Vercel URL itself changes.

## Content principles

- **No fabricated content, ever.** Current-affairs digest entries (`src/data/digestPosts.ts`) are real, dated events verified via web search, each linking to its actual source — never invented "news." This list needs periodic manual refresh; it is not a live feed.
- **No fake progress/activity stats.** Chapter-completion percentages and streaks start at zero for every account — there is no real tracking mechanism yet, so showing anything else would misrepresent an account's actual history.
- **Quiz/mock-test questions are original**, written and independently verified for correctness (not copied from any textbook or publisher) — see the licensing note below for why.
- **Textbook/publisher content licensing**: NCERT and commercial exam-prep publishers (Arihant, S. Chand, Lucent, etc.) hold copyright on their specific wording — using their content directly would need an explicit paid licensing agreement per publisher. The app instead writes original content from the public syllabus, and cites official government sources (UPSC/AFCAT notifications, PIB releases) directly for facts.

## Local development

```bash
npm install
npm run dev          # frontend, http://localhost:5173

cd server
npm install
npm run dev          # backend, http://localhost:4000
```

Copy `.env.example` → `.env` (root) and `server/.env.example` → `server/.env`, filling in real values (MSG91 widget credentials, local Postgres connection string).

## Building the Android APK

Only needed when the native shell itself changes (icon, app name, or the Vercel URL):

```bash
npm run build && npx cap sync android
cd android
JAVA_HOME="<path to JDK 21>" ./gradlew assembleRelease
```

Signed with `android/app/release.keystore` (gitignored) — see `android/keystore.properties`.
