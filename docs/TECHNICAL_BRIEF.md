# MissionFauj — Technical Brief

Single source of truth for what MissionFauj is, how it's built, and why — kept up to date as the app develops. If a decision here conflicts with convenience, this document wins.

Companion document: `docs/FUNCTIONAL_SPEC.md` (screens, flows, content rules).

## 1. What MissionFauj Is

A mobile-first web app for Indian defence-services exam aspirants — NDA, CDS, AFCAT written-exam prep, SSB psychology/GTO/interview training, expert consultation, and reference content (eligibility rules, glossary, FAQs). Targets candidates as young as 15–16.5 (NDA joining age starts at 16.5), so DPDP Act (India's child-data-protection law) compliance is load-bearing, not a nice-to-have.

## 2. Architecture

```
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│  Android APK     │──────▶│  Vercel (frontend)    │──────▶│  Render (backend)│
│  (thin shell)    │  loads │  missionfauj.vercel.app│  API  │  missionfauj-otp-│
│                  │  live  │  React+TS+Vite+Tailwind│ calls │  server (Express)│
└─────────────────┘  URL   └──────────────────────┘        └────────┬────────┘
                                    │                                │
                                    │ direct browser calls           │
                                    ▼                                ▼
                            ┌───────────────┐              ┌─────────────────┐
                            │  MSG91 Widget  │              │  Render Postgres │
                            │  API (OTP)     │              │  (sessions,      │
                            └───────────────┘              │  consent records)│
                                                             └─────────────────┘
```

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 (CSS-first `@theme` config, no `tailwind.config.js`). React Router v6 for page routing; most multi-step flows use internal `view`/`step` state rather than nested routes. State/persistence: Context + `usePersistedState` (a `localStorage`-backed `useState` wrapper, keys namespaced under `missionfauj:`) — no backend database for onboarding/subscription/profile data, only for auth sessions and consent records.
- **Backend** (`server/`): Node/Express/TypeScript + Prisma + PostgreSQL. Scope is deliberately narrow — session tokens (JWT) and the versioned DPDP consent record. It does **not** talk to MSG91 (see §5).
- **Android app**: Capacitor 8, thin-shell pattern — `capacitor.config.ts`'s `server.url` points at the live Vercel deployment instead of bundling built web assets into the APK (`webDir` points at a placeholder, `www-shell/`). A web-only change ships via `vercel --prod` (or a `git push` once GitHub auto-deploy is authorized) and every installed app picks it up on next open — no APK rebuild. An APK rebuild is only needed if the icon, app name, or the Vercel URL itself changes.
- **Deployment**:
  - Frontend → Vercel project `missionfauj` (`vercel.json` sets `framework: vite` explicitly and an SPA rewrite for React Router; `.vercelignore` excludes `server/` so Vercel doesn't try to auto-detect and manage the Express backend as one of its own services).
  - Backend → Render service `missionfauj-otp-server`, blueprint in `render.yaml`. `DATABASE_URL` and `JWT_SECRET` are Render env vars (`sync: false`/`generateValue: true`) — not committed.
  - GitHub repo: `divyanec-cpu/MissionFauj`, `main` branch. Vercel↔GitHub connection is authorized (confirmed: a push auto-triggers a production deploy).

## 3. Auth & OTP — Why It's Shaped the Way It Is

This is the most-iterated part of the codebase; the current shape is the result of several dead ends.

- **OTP send/verify happens entirely client-side** (`src/lib/msg91Client.ts`), calling MSG91's Widget REST API (`control.msg91.com/api/v5/widget/*`) directly from the browser with a 15s request timeout. This was **not** the original design — server-side calls from Render were tried first and hit MSG91's own anti-abuse system, which intermittently returns `IPBlocked` (code 408) against Render's outbound IP. This was reproduced live, twice, including immediately after MSG91 support "fixed" it — confirming it's an automated abuse-detection behavior, not a one-off manual block a support ticket reliably clears. CORS was confirmed open for direct browser calls, so the fix was architectural: move the MSG91 calls to the user's own device/network entirely.
- **The backend's role in auth is now narrow**: `/auth/otp-sent` is bookkeeping only (records that a client-side send happened, for a freshness check); `/auth/verify-otp` issues the session JWT based on that bookkeeping row being fresh, **not** by re-checking the code with MSG91 (which would hit the same IP-block problem). The trade-off: the backend trusts the client's report that verification succeeded, rather than independently confirming it. Accepted given the app's risk profile (exam prep, not financial) — but this is the one place a determined attacker with a modified client could bypass without needing the real SMS code, so don't extend this trust model into anything higher-stakes without revisiting it.
- **`VITE_MSG91_WIDGET_ID` / `VITE_MSG91_TOKEN_AUTH`** are frontend build-time env vars (Vercel project settings + local `.env`/`.env.production`), not server secrets — this MSG91 product's widgetId+tokenAuth pair is meant to be client-embeddable (same values MSG91's own hosted widget script would expose), unlike an account Authkey.
- **Age is server-computed** from a raw day/month/year submitted after OTP verification (`/auth/confirm-age`), never trusted from client-side "age" state — this exists specifically so a minor can't self-declare 18+ to skip guardian consent.
- **Consent** (`ConsentRecord` in Postgres): versioned (`CONSENT_VERSION = 'v1'`), timestamped, and requires the actual verified phone of whoever is consenting — a guardian consent can't be recorded unless that guardian independently verified their own phone via OTP first. This is enforced at the API layer (`/auth/consent`), not just hidden in the UI.
- **Sign-out is a lightweight logout** — clears only the `auth` gate (`AppStateContext.signOut`), not profile/eligibility/subscriptions/name/path. Rationale: the common case is the same person signing back in with the same number, and there's no backend account to re-key that data to; a full wipe would lose real progress for no benefit in the single-user-per-device case. (Trade-off: on a genuinely shared device with a different candidate signing in, that candidate would see the previous person's onboarding profile until it's manually reset — accepted since the app is designed around one candidate owning their own device.)
- **`RootGate` (`App.tsx`) gates on `candidateName` alone**, not `candidateName && candidatePath` — both are actually set together (`completeSetup`), but checking name alone is sufficient since path is always chosen first in the same linear flow, and it avoids a real bug that surfaced during development: `OnboardingPage`'s "eligibility prompt" step (last step, after name entry) never rendered when `completeSetup` was called immediately after the Name step, because writing `candidateName` to context synchronously flips `RootGate` from `OnboardingPage` to `HomePage`, unmounting the whole onboarding component — including its own local `step` state — before the prompt step ever got a chance to show. Fixed by keeping name/path in `OnboardingPage`'s local state through all three steps and only calling `appState.completeSetup(name, path)` at the point the candidate actually leaves onboarding (Take Test or Skip), not right after the Name step. Any future onboarding step added after the one that "completes" a gate needs the same care — don't write the gating field to context until the flow is actually done.

## 4. Data Model

**Local only** (`localStorage`, via `usePersistedState`, key-namespaced `missionfauj:*`):
`auth` (`VerifiedAuth`: candidatePhone, age, isMinor, guardianName?, guardianPhone?, consentAcceptedAt), `candidateName` (set once during the slim onboarding — see §3), `candidatePath` (`CandidatePath`: `'school'|'graduate'|'ssb-only'` — drives which Written Exam Prep tabs show, `src/types/candidatePath.ts`), `profile` (`CandidateProfile`: age, gender, marital, education, stream, ncc — now only populated if/when the optional Eligibility Check tool is used), `eligibilityResults` (`SchemeResult[]`, likewise optional), `writtenSubscriptions` (per-exam `SubscriptionState`), `ssbSubscription`, `ssbRegistration`, `aiUsage` (per-surface free-question counters).

**Backend** (Postgres via Prisma, `server/prisma/schema.prisma`):
- `OtpSession` — phone (unique), reqId (client-reported, informational), purpose (`candidate`|`guardian`), timestamps. TTL-checked (15 min) for the verify-otp freshness gate.
- `ConsentRecord` — candidatePhone, role (`self`|`guardian`), consentVersion, guardianName?, guardianPhone?, acceptedAt. Indexed on candidatePhone.
- `AiUsageEvent` — surface (`ssb`|`digest`), createdAt. One row per successful AI Assist reply, logged from `server/src/routes/ai.ts`. Deliberately minimal (no phone, no question text) — it exists only to answer "is this feature actually being used," not to build a per-user profile.
- `AdminUser` — email (unique), passwordHash (scrypt). The real admin login (see §6).
- `Expert`, `DigestPost`, `PricingPlan`, `EligibilityRule` — the four content tables behind the admin CMS (see §6). Each has `active`/`sortOrder` fields the public `/content/*` endpoints and admin list views both respect.
- `SubscriptionEvent` — kind (`written_trial`|`written_subscribed`|`ssb_trial`|`ssb_subscribed`), exam (nullable), createdAt. Mirrors `AiUsageEvent`'s design exactly — aggregate adoption signal only.

**Eligibility engine** (`src/lib/eligibilityEngine.ts`): 13 entry schemes (NDA Army/Navy/Air Force, Naval Academy, CDS-IMA/INA/AFA/OTA, AFCAT Flying/Ground, TES, NCC Special Entry, Territorial Army) — `evaluateSchemes(profile, rules)` walks each rule's `failPriority` to produce the exact fail-reason shown. The rule table itself now lives in the `EligibilityRule` Postgres table (admin-editable, see §6) rather than a static frontend file — the engine's contract (`SchemeRule[]` in, `SchemeResult[]` out) didn't need to change, only where the rules come from.

## 5. Content Principles (non-negotiable)

- **No fabricated content, ever.** Current-affairs digest entries (`DigestPost` table, admin-editable at `/admin/digest-posts`) are real, dated events verified via web search, each with a source link — the original build had 3 invented "news" events presented as real, which was caught and replaced. This list needs periodic manual refresh (now via the admin panel, not a code deploy); it is not a live feed.
- **No fake per-user activity.** Chapter-completion percentages (`ndaChapters.ts`, `cdsSubjects.ts`) and streaks (`NdaHub.tsx`) start at zero for every account — there's no real progress-tracking mechanism yet, so anything else would misrepresent what an account actually did. (Also caught and fixed after shipping with hardcoded non-zero sample values.)
- **Quiz/mock-test questions are original**, written and independently verified for correctness — not copied from NCERT or any commercial publisher (Arihant, S. Chand, Lucent, etc.), since reproducing their specific wording would require a paid licensing agreement per publisher. Facts/formulas/syllabus topics aren't copyrightable; specific textbook expression is.
- **SSB psychology/GTO/interview content is never auto-scored** — every exercise (`src/pages/ssb/modules/*Runner.tsx`) ends at `SelfReviewRubric`, a self-toggleable OLQ checklist + free-text reflection, never a numeric or AI-generated verdict. This is enforced structurally (one shared component every runner routes to), not just by convention.
- **AI Assist is explanatory only**, never a scorer, in both the written-exam current-affairs context and the SSB context. Both surfaces (`src/pages/ssb/AiAssistantBonus.tsx`, `src/pages/written-exam/CurrentAffairsDigest.tsx`) call a real backend endpoint (`server/src/routes/ai.ts`, `POST /ai/ask`, Anthropic Claude API via `@anthropic-ai/sdk`) — the "never scores or verdicts psychology/interview answers" rule is enforced in the system prompt sent to the model, not just in client-side copy, so it holds even if a candidate pastes their own answer and asks to be scored. Requires a server-only `ANTHROPIC_API_KEY` (never a `VITE_` var — unlike MSG91's client-embeddable widget credentials, this is a true high-value secret).
- **Exam timeline data** (`src/data/examTimelines.ts`) uses stable month-level/relative-duration patterns ("NDA I: ~April", "~2–3 months after result"), not exact calendar dates — those shift year to year and would go stale/misleading. A visible disclaimer points to the official UPSC/AFCAT sites for current dates.
- **The eligibility check never gates prep content.** It moved from a mandatory onboarding step to a fully optional tool (`/eligibility-check`, Functional Spec §5) reachable from the header any time. `WrittenExamPrepPage` decides which exam tabs to show purely from `candidatePath` (school/graduate/ssb-only) — it has no dependency on `eligibilityResults` at all. Rationale: a pass/fail eligibility check is not a legitimate reason to block someone from studying — the app's job is to help candidates prepare, not to pre-judge who's "allowed" to.

## 6. Admin Panel & Real Usage Tracking

Everything below lives inside the Express backend itself (`server/src/routes/admin/*`, `server/src/routes/content.ts`), server-rendered HTML — **not** a section of the React SPA. Reachable at `https://missionfauj-otp-server.onrender.com/admin`, entirely separate from the candidate-facing app and from candidate auth (its own login, its own session, no shared code with `/auth/*`). This keeps the admin session same-origin (no cross-origin cookie/CORS complexity) and needed zero new npm dependencies — password hashing uses Node's built-in `crypto.scrypt`, and cookie read/write is a few hand-rolled lines rather than pulling in `cookie-parser` for a single cookie.

**Admin login** — a real account (`AdminUser`: email + scrypt-hashed password), not the shared `ADMIN_TOKEN`/HTTP-Basic gate this replaced. Session is a JWT (`jwt.ts`'s `AdminSessionPayload`, 7-day TTL — deliberately much longer than the candidate OTP tokens' 20 minutes, since this is a persistent login an owner returns to across days) carried in an httpOnly `admin_session` cookie (`SameSite=Lax`, `Secure` when `req.secure` — hence `app.set('trust proxy', 1)` in `index.ts`, so that reflects HTTPS correctly behind Render's proxy). The first admin account is bootstrapped once at server startup from `ADMIN_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` env vars, only while the `AdminUser` table is empty (`index.ts`'s `bootstrapAdmin()`) — idempotent, so it's safe to leave those vars set permanently as a recovery path. Additional admins are added/removed from `/admin/admin-users` (password changes there too); the last remaining admin account can't be deleted, to avoid a full lockout. **Known limitation**: session JWTs are verified cryptographically only, never re-checked against the DB per request — deleting an admin doesn't immediately invalidate their existing session cookie until it expires. Acceptable for a single/few-admin internal tool; would need revisiting before this pattern is reused anywhere higher-stakes.

**Content management** — four data sets that used to be static frontend files are now Postgres tables with admin CRUD screens, generated from a shared scaffold (`server/src/lib/adminResource.ts` — list/create/edit/delete pages driven by field metadata) rather than hand-writing near-identical routes four times over:

- `Expert` (`/admin/experts`) — Expert Consultation listings.
- `DigestPost` (`/admin/digest-posts`) — Current Affairs digest.
- `PricingPlan` (`/admin/pricing-plans`) — written-exam and SSB pricing in one table (`scope` field distinguishes them). `priceValue` is only populated for `scope: 'ssb'`, since that's the only place the frontend needs a real number — the 20% existing-member-discount calculation in `ModulePaywall.tsx`; `scope: 'written'` plans only ever display `price` as text.
- `EligibilityRule` (`/admin/eligibility-rules`) — the 13-scheme table. Its `id` is a human-meaningful slug (e.g. `nda-army`) the admin sets once at creation, not a generated id — matching how the original static file keyed these, and keeping them stable as lookup keys.

Admin accounts (`/admin/admin-users`) didn't fit this scaffold — password handling and the last-admin-delete guard are meaningfully different from the other four resources' shape, so it's a small bespoke route file instead of forced through the generic one.

The frontend fetches all four content types at runtime (`src/lib/contentApi.ts`) instead of statically importing them — `src/data/{experts,digestPosts,pricingPlans}.ts` now only export shared TypeScript types plus the two genuinely-static lists (`EXPERT_CATEGORIES`, `FEATURE_LIST`); `src/data/eligibilityRules.ts` was deleted outright. **One-time content seed**: `server/prisma/seed.ts` (idempotent — skips any table that already has rows) inserts the exact data that used to live in those static files, so a fresh deploy isn't left with empty tables. Run manually via `npx prisma db seed`, same deliberate-step discipline as `prisma migrate deploy` — **not** run automatically on every server boot, so it can never silently overwrite an admin's later edits.

**Real usage tracking** — two independent mechanisms, one behavioral, one account-level:

- **Plausible analytics** (`index.html`, `<script defer data-domain="missionfauj.vercel.app" src="https://plausible.io/js/script.js">`) — cookieless, collects no personal data (aggregate page views/referrers/device type only), ignores `localhost` automatically. Chosen over more invasive defaults (e.g. PostHog's autocapture/session recording) specifically because this app's DPDP posture is load-bearing — a tool that captures no PII needs no additional consent-flow surgery beyond a one-line transparency note (added to the login sequence's consent copy and Data & Privacy FAQ). **The dashboard requires signing up at plausible.io for the `missionfauj.vercel.app` site** — not something that can be provisioned without a human creating that account.
- **`/admin/stats`** (`server/src/routes/admin/stats.ts`): unique signups (distinct `candidatePhone` across `ConsentRecord`, split self vs. guardian-consented), `AiUsageEvent` totals and by-surface breakdown, `SubscriptionEvent` totals and by-kind breakdown (written/SSB trial starts — `AppStateContext`'s `startWrittenTrial`/`startSsbTrial` fire a non-blocking `trackSubscriptionEvent` call alongside their existing local-state update; the call sits *outside* the `setState` updater specifically because React's StrictMode double-invokes updater functions to surface impure reducers, which would otherwise double-log the event), each with a 30-day daily breakdown. Intentionally shows **no** phone numbers or chat/subscription content — aggregate counts only, consistent with the "no per-user profile" principle in §5.

## 7. Known Issues / Open Items

- **MSG91 IP-blocking is unresolved as a root cause**, only architecturally routed around (client-side calls). If MSG91 ever blocks client-side widget calls too (e.g. by device/IP reputation rather than just datacenter ranges), this will need revisiting.
- **Vercel↔GitHub auto-deploy**: confirmed working now, but the very first connection attempt failed silently (`Failed to connect divyanec-cpu/MissionFauj to project`) until GitHub access was manually granted — if this repo is ever transferred/renamed, expect to reconnect it.
- **No real payment integration** — pricing/paywall screens are UI-state only (`startWrittenTrial`/`startSsbTrial` just flip local subscription state). Explicitly out of scope per the original brief.
- **Expert Consultation** rows still hold their original `"— to be added —"` placeholders for names/bios/pricing — the admin CMS to edit them now exists (`/admin/experts`, see §6), but nobody has entered real expert data yet. Edit the 5 seeded rows there when real experts are on-boarded.

## 8. Build/Deploy Commands Reference

```bash
# Frontend dev
npm install && npm run dev                     # http://localhost:5173

# Backend dev
cd server && npm install && npm run dev         # http://localhost:4000

# Deploy frontend (manual; auto-deploy also runs on push to main)
vercel --prod

# Rebuild Android shell (only when icon/name/URL changes)
npm run build && npx cap sync android
cd android && JAVA_HOME="<JDK 21 path>" ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk

# Backend migration (deliberate, not automatic on deploy)
cd server && npx prisma migrate deploy

# One-time content seed (Experts/DigestPosts/PricingPlans/EligibilityRules —
# idempotent, but still a deliberate manual step, not automatic on deploy)
cd server && npx prisma db seed
```
