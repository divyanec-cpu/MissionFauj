# MissionFauj

Exam-prep and SSB-training app for Indian defence-services aspirants (NDA, CDS, AFCAT, and other officer-entry schemes). React + TypeScript + Vite + Tailwind CSS, wrapped as an Android app via Capacitor.

## Architecture

- **Frontend** (this repo's `src/`): deployed to Vercel at [missionfauj.vercel.app](https://missionfauj.vercel.app). `vercel --prod` deploys manually, or push to `main` once the Vercel↔GitHub connection is authorized.
- **Backend** (`server/`): Express + Prisma + Postgres, handles session tokens and the versioned DPDP consent record. Deployed to Render (`missionfauj-otp-server`) via `render.yaml`. OTP send/verify itself happens client-side against MSG91 directly (see `src/lib/msg91Client.ts`) — Render's outbound IP gets intermittently blocked by MSG91's widget anti-abuse layer, so the backend never calls MSG91 itself.
- **Android app**: a thin Capacitor shell (`capacitor.config.ts`'s `server.url`) pointing at the live Vercel deployment, not a bundled build. Deploying the web app updates every installed copy on next open — no APK rebuild needed unless the app icon, name, or the Vercel URL itself changes.

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
