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
- **Sign-out is a lightweight logout** — clears only the `auth` gate (`AppStateContext.signOut`), not profile/eligibility/subscriptions. Rationale: the common case is the same person signing back in with the same number, and there's no backend account to re-key that data to; a full wipe would lose real progress for no benefit in the single-user-per-device case. (Trade-off: on a genuinely shared device with a different candidate signing in, that candidate would see the previous person's onboarding profile until it's manually reset — accepted since the app is designed around one candidate owning their own device.)

## 4. Data Model

**Local only** (`localStorage`, via `usePersistedState`, key-namespaced `missionfauj:*`):
`auth` (`VerifiedAuth`: candidatePhone, age, isMinor, guardianName?, guardianPhone?, consentAcceptedAt), `profile` (`CandidateProfile`: age, gender, marital, education, stream, ncc), `eligibilityResults` (`SchemeResult[]`), `writtenSubscriptions` (per-exam `SubscriptionState`), `ssbSubscription`, `ssbRegistration`, `aiUsage` (per-surface free-question counters).

**Backend** (Postgres via Prisma, `server/prisma/schema.prisma`):
- `OtpSession` — phone (unique), reqId (client-reported, informational), purpose (`candidate`|`guardian`), timestamps. TTL-checked (15 min) for the verify-otp freshness gate.
- `ConsentRecord` — candidatePhone, role (`self`|`guardian`), consentVersion, guardianName?, guardianPhone?, acceptedAt. Indexed on candidatePhone.
- `AiUsageEvent` — surface (`ssb`|`digest`), createdAt. One row per successful AI Assist reply, logged from `server/src/routes/ai.ts`. Deliberately minimal (no phone, no question text) — it exists only to answer "is this feature actually being used," not to build a per-user profile.

**Eligibility engine** (`src/lib/eligibilityEngine.ts` + `src/data/eligibilityRules.ts`): 13 entry schemes (NDA Army/Navy/Air Force, Naval Academy, CDS-IMA/INA/AFA/OTA, AFCAT Flying/Ground, TES, NCC Special Entry, Territorial Army) as a data table, not hardcoded per-scheme branches — `evaluateSchemes(profile, rules)` walks each rule's `failPriority` to produce the exact fail-reason shown. This is the intentional "admin-configurable" pattern since official age/education criteria change yearly.

## 5. Content Principles (non-negotiable)

- **No fabricated content, ever.** Current-affairs digest entries (`src/data/digestPosts.ts`) are real, dated events verified via web search, each with a source link — the original build had 3 invented "news" events presented as real, which was caught and replaced. This list needs periodic manual refresh; it is not a live feed.
- **No fake per-user activity.** Chapter-completion percentages (`ndaChapters.ts`, `cdsSubjects.ts`) and streaks (`NdaHub.tsx`) start at zero for every account — there's no real progress-tracking mechanism yet, so anything else would misrepresent what an account actually did. (Also caught and fixed after shipping with hardcoded non-zero sample values.)
- **Quiz/mock-test questions are original**, written and independently verified for correctness — not copied from NCERT or any commercial publisher (Arihant, S. Chand, Lucent, etc.), since reproducing their specific wording would require a paid licensing agreement per publisher. Facts/formulas/syllabus topics aren't copyrightable; specific textbook expression is.
- **SSB psychology/GTO/interview content is never auto-scored** — every exercise (`src/pages/ssb/modules/*Runner.tsx`) ends at `SelfReviewRubric`, a self-toggleable OLQ checklist + free-text reflection, never a numeric or AI-generated verdict. This is enforced structurally (one shared component every runner routes to), not just by convention.
- **AI Assist is explanatory only**, never a scorer, in both the written-exam current-affairs context and the SSB context. Both surfaces (`src/pages/ssb/AiAssistantBonus.tsx`, `src/pages/written-exam/CurrentAffairsDigest.tsx`) call a real backend endpoint (`server/src/routes/ai.ts`, `POST /ai/ask`, Anthropic Claude API via `@anthropic-ai/sdk`) — the "never scores or verdicts psychology/interview answers" rule is enforced in the system prompt sent to the model, not just in client-side copy, so it holds even if a candidate pastes their own answer and asks to be scored. Requires a server-only `ANTHROPIC_API_KEY` (never a `VITE_` var — unlike MSG91's client-embeddable widget credentials, this is a true high-value secret).
- **Exam timeline data** (`src/data/examTimelines.ts`) uses stable month-level/relative-duration patterns ("NDA I: ~April", "~2–3 months after result"), not exact calendar dates — those shift year to year and would go stale/misleading. A visible disclaimer points to the official UPSC/AFCAT sites for current dates.

## 6. Real Usage Tracking

Two separate mechanisms, deliberately kept independent — one for behavioral/adoption signal, one for account-level facts:

- **Plausible analytics** (`index.html`, `<script defer data-domain="missionfauj.vercel.app" src="https://plausible.io/js/script.js">`) — cookieless, collects no personal data (aggregate page views/referrers/device type only), ignores `localhost` automatically. Chosen over more invasive tools (e.g. default-configured PostHog) specifically because this app's DPDP posture is load-bearing — a tool that captures no PII needs no additional consent-flow surgery beyond a one-line transparency note (added to the login sequence's consent copy and Data & Privacy FAQ). **The dashboard requires signing up at plausible.io for the `missionfauj.vercel.app` site** — not something that can be provisioned without a human creating that account.
- **`/admin/stats`** (`server/src/routes/admin.ts`): a plain server-rendered HTML page behind HTTP Basic Auth (any username, password = `ADMIN_TOKEN`, compared with `crypto.timingSafeEqual`). Reports aggregate facts the analytics tool can't see because they live in Postgres: unique signups (distinct `candidatePhone` across `ConsentRecord`, split self vs. guardian-consented), signups per day (30d), total `AiUsageEvent` count, AI Assist replies per day (30d), and a breakdown by surface (`ssb` vs `digest`). Intentionally shows **no** phone numbers or chat content — aggregate counts only, consistent with the "no per-user profile" principle above. `ADMIN_TOKEN` is `generateValue: true` in `render.yaml` (Render mints it; read it from the dashboard's Environment tab) — same non-secret-in-chat discipline as `JWT_SECRET`/`ANTHROPIC_API_KEY`.

## 7. Known Issues / Open Items

- **MSG91 IP-blocking is unresolved as a root cause**, only architecturally routed around (client-side calls). If MSG91 ever blocks client-side widget calls too (e.g. by device/IP reputation rather than just datacenter ranges), this will need revisiting.
- **Vercel↔GitHub auto-deploy**: confirmed working now, but the very first connection attempt failed silently (`Failed to connect divyanec-cpu/MissionFauj to project`) until GitHub access was manually granted — if this repo is ever transferred/renamed, expect to reconnect it.
- **No real payment integration** — pricing/paywall screens are UI-state only (`startWrittenTrial`/`startSsbTrial` just flip local subscription state). Explicitly out of scope per the original brief.
- **Expert Consultation** (`src/data/experts.ts`) uses explicit `"— to be added —"` placeholders for expert names/bios/pricing — intentional (CMS-editable-later pattern per the original brief), not a bug.

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
```
