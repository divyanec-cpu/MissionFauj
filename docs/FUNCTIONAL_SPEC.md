# MissionFauj — Functional Spec

Screens, flows, and content rules — what a candidate (and, where relevant, their parent/guardian) actually sees and does. Companion document: `docs/TECHNICAL_BRIEF.md` (architecture, data model, why things are built the way they are).

## 1. Visual System

Disciplined, military-inspired, modern — not costume-y.

- **Palette**: near-black olive ground (`#12130e`), dark olive panels (`#1b1d15`/`#22251a`), hairline olive-grey borders (`#3a3d2e`), khaki text accent (`#c9bd97`), muted warm-grey body text (`#9b9a86`), amber/gold primary accent (`#d99a3d`), sage-olive "eligible/success" (`#7a8b4f`), muted rust "not-eligible/warning" (`#9c5b3c`), steel-blue-grey secondary (`#5c6670`).
- **Type**: Rajdhani (600/700) for headings/labels/buttons, uppercase with letterspacing; IBM Plex Sans (400/500/600) for body copy.
- **Geometry**: sharp angular clip-path corners on cards/buttons/badges — no rounded corners anywhere. Left-border or top-border accent stripes on cards (3–4px, amber/steel/sage depending on category).
- **Motion**: subtle fade+rise-in on screen entry, animated progress bars, staggered reveal on the eligibility scan.
- No gradients, emoji, rounded pill buttons, or drop shadows.

## 2. Entry Flow: Login Sequence (`src/pages/login/LoginSequencePage.tsx`)

The first thing any new user sees — gates everything else (`App.tsx`'s `RootGate`: no `auth` → Login Sequence; `auth` present and no `candidateName` yet → Onboarding; both present → Home).

1. **Welcome** ("Report For Duty") → candidate's own mobile number → OTP (real SMS via MSG91, client-side) → **Date of Birth** (server-computed age, never client-trusted).
2. **Branch by age**:
   - **18+**: a plain-language consent screen (what's collected, how AI is used, retention/deletion, rights under DPDP) → done.
   - **Under 18**: guardian's name + mobile → guardian's own OTP (independently verified — the guardian must prove their own phone, not just be named) → guardian consent screen (what the child logs, what stays private from the guardian, guardian's rights) → done.
3. **Done** screen → "Continue" → Onboarding.

A help drawer (FAQ groups: Login & OTP, Guardian Consent, Your Data & Privacy) is available throughout via a `?` icon. Both consent screens and the "Your Data & Privacy" FAQ group disclose the site's cookieless, no-PII usage analytics (Plausible) alongside what's collected about the candidate specifically.

## 3. Onboarding (`src/pages/onboarding/OnboardingPage.tsx`)

One-time mandatory setup: a "what brings you here" choice, a name, and the full candidate profile the eligibility engine needs — nothing about the candidate is ever assumed or defaulted. Steps: `path → name → profile → scanning → report`.

- **Path** (`PathStep.tsx`): three cards — **School Student** (targeting NDA), **Graduate** (targeting CDS/AFCAT), **SSB Only** (already past the written exam). This choice drives which Written Exam Prep tabs a candidate sees (§6) — School sees NDA only, Graduate sees CDS+AFCAT, SSB Only sees all three (never hidden, just not the emphasized landing). Changeable any time from Home (§4) or Profile (§10).
- **Name** (`NameStep.tsx`): one free-text field, validated with the same name pattern used for guardian names during login.
- **Profile** (shared `src/components/ProfileStep.tsx`): age is locked ("✓ Verified at sign-in", from the Login Sequence), everything else — gender, marital status, education level, 12th stream (conditional on education), NCC status — starts with **no option pre-selected**. Continue stays disabled until every required field has been actively answered (`isProfileComplete`, `src/types/profile.ts`); nothing renders as already-chosen for the candidate to unknowingly leave in place.
- **Scanning / Report**: the same animated scan and per-scheme report used by the standalone Eligibility Check tool (§5), run automatically the moment Profile is submitted — real answers, not a placeholder run. "Redo Profile" goes back a step if something was mis-clicked; "Enter MissionFauj →" finishes setup.

`candidateName`, `candidatePath`, `profile`, and `eligibilityResults` are only written to persisted state together, once the candidate clicks through the final report screen — not at the Name or Profile step — since writing `candidateName` any earlier would flip `RootGate` straight to Home mid-flow, unmounting `OnboardingPage` before the scan/report steps ever render. The eligibility check computed here still never gates prep content (§6, §7) — collecting it during setup is about not assuming data, not about restricting access.

## 4. Home (`src/pages/HomePage.tsx`)

The landing page once onboarding is done — ties the app's sections together, which nothing did before this existed.

- Greeting using the candidate's name; a path-appropriate one-line description.
- If the eligibility check hasn't been run yet (only possible for accounts created before profile collection moved into onboarding): a persistent card inviting it (§5) — not a one-time dismissible nag, since the header link (§11) and this card are both always available.
- A primary/secondary CTA pair for Written Exam Prep and SSB Training — School/Graduate emphasize Written Exam Prep, SSB Only emphasizes SSB Training. Both are always one tap away regardless of path.
- An Expert Consultation link (§8) — previously only reachable from one deep link inside the SSB module hub.
- A "Change Your Path" control — three pills, switches `candidatePath` immediately (same control also appears on Profile, §10).

## 5. Eligibility Check (`src/pages/eligibility/EligibilityCheckPage.tsx`)

A standalone tool — reachable any time from the header (§11) or Home's nudge card (§4), never a gate on Written Exam Prep or SSB Training. The profile it needs is now collected once during onboarding (§3), so on first visit this page just shows that already-computed `report` — it exists here for **retaking** the scan later (status changed: cleared 12th, got an NCC certificate, etc.) and, as a fallback, for accounts created before profile collection moved into onboarding. Steps: `briefing → profile → scanning → report → prep`; "Retake Briefing" clears the stored profile/result and re-asks.

- **Briefing**: what the scan covers.
- **Profile** (shared `src/components/ProfileStep.tsx`, same component onboarding uses): age (locked, "✓ Verified at sign-in" — not re-editable), gender, marital status, education level, 12th stream (conditional on education), NCC status — no option pre-selected, same as at onboarding.
- **Scanning**: animated scan against the 13-scheme eligibility table (fetched from the database at runtime, admin-editable at `/admin/eligibility-rules` — see Technical Brief §6 — not a static frontend file).
- **Report**: per-scheme eligible/not-eligible cards with specific reasons (age/education/marital/NCC/stream), counts of eligible vs. not.
- **Prep** (`PrepTeaserStep.tsx`): exam picker (NDA/CDS/AFCAT cards). Clicking "See {exam} Process & Timeline" opens a full **selection-process flowchart** (`ExamProcessTimeline.tsx` + `examTimelines.ts`) — notification → application → written exam → result → SSB/AFSB → medical → merit list → joining, with realistic month-level timing and a disclaimer to check official sites for exact current dates. Framed as useful for a parent to see too, not just the candidate.

## 6. Written Exam Prep (`src/pages/written-exam/WrittenExamPrepPage.tsx`)

Which exam tabs show is driven entirely by the candidate's chosen path (§3) — **never** by the eligibility check. School sees NDA only; Graduate sees CDS+AFCAT; SSB Only sees all three. There is no "complete the eligibility scan first" gate of any kind — a candidate can start prep the moment onboarding finishes. Each exam has its own hub layout:

- **NDA** (`NdaHub.tsx`): chapter accordion (Mathematics, GAT — English & GK), each chapter showing real (zeroed-until-tracked) completion %; a daily streak card; Mock Tests (Sectional Trigonometry, Full-Length Maths, Full-Length GAT); Current Affairs digest with per-post "Chat with AI Assist" (real Claude-backed answers, contextualized to the post — see §12).
- **CDS** (`CdsHub.tsx`): track toggle (IMA/INA/AFA vs. OTA — OTA skips the Maths paper), subject list with completion %.
- **AFCAT** (`AfcatHub.tsx`): dual AFCAT/EKT tracks with a branch picker (Mechanical/Computer Science/Electrical & Electronics) for the technical EKT paper.
- **Shared**: `ChapterDetail.tsx` (definition/formulas/solved example — only Quadratic Equations has full authored content, others fall back to a generic note), `MockTestRunner.tsx` (per-question or overall timer, submit → score + right/wrong breakdown — real scoring, since this is objective content), `QuizRunner.tsx` (shorter, immediate feedback), `FeaturesOverview.tsx` → `PricingPlansView.tsx` (7-day trial CTA, no live payment; plans are fetched from the database, admin-editable at `/admin/pricing-plans`).
- SSB-teaser banner links to `/ssb-training`.

**Question banks** (`mockQuestionBanks.ts`, `quizQuestions.ts`): original, verified MCQs. Mock tests: 10–20 questions each depending on test; quick quizzes: 12–13 per exam for variety on repeat attempts.

## 7. SSB Training (`src/pages/ssb/SsbTrainingPage.tsx`)

Never gated by path or eligibility — reachable directly regardless of what a candidate picked during onboarding.

1. **Registration**: entry scheme picker (`SchemeStep.tsx`) → attempt count (`AttemptsStep.tsx`) → welcome (`WelcomeStep.tsx`).
2. **Module Hub** (`ModuleHub.tsx`), grouped:
   - **Psychology**: TAT (30s view, 4 min write per image), WAT (15s/word, backspace/paste blocked — enforced, not just described), SRT (timed situation reactions), Self Description (5 fixed perspectives, timed).
   - **Group Testing**: PPDT (30s picture view + text narration/discussion, no recording), Lecturette (random topic, prep countdown + timed delivery notes), Group Tasks (GD/GPE-style text planning exercises).
   - **Interview & Self-Assessment**: PIQ & Interview Prep (scheme-tuned question bank), OLQ Self-Assessment (all 15 Officer-Like Qualities, self-reflection only).
   - **Free bonus** (always open, any subscription state): English & Confidence study material, AI Assistant — real Claude-backed Q&A (3 free in trial, unlimited when subscribed), see §12.
3. **Paywall** (`ModulePaywall.tsx`): skipped if already subscribed; shows the 20% existing-member discount automatically when a written-exam trial/subscription is active (`isExistingMember`, derived — not a manual toggle). `ModuleUnlocked.tsx` for the unlocked state.
4. **Every exercise runner ends at `SelfReviewRubric`** — the OLQ tags relevant to that module, self-toggleable, plus free-text reflection. Never a score, never an AI verdict. This is the one rule enforced structurally across all seven runners.

## 8. Expert Consultation (`src/pages/ExpertConsultationPage.tsx`)

Category filter (IO / GTO / Psychologist / Board President / English & Confidence coach) → expert card (designation, credentials, bio, price — fetched from the database, admin-editable at `/admin/experts`; currently still holding their original `"— to be added —"` placeholder content) → slot picker → confirmation. Explicitly a v1.1+ stretch per the original brief, built prototype-exact with no functional scope beyond booking-flow UI. Now reachable from Home (§4) and Help Center/Glossary (§9) in addition to the SSB module hub — previously the only place linking to it.

## 9. Help Center & Glossary

- **Help Center** (`HelpCenterPage.tsx`): eligibility/qualification reference table (13 schemes), 5-day SSB process breakdown, searchable FAQ (`FAQSearch.tsx`, client-side substring match).
- **Glossary** (`GlossaryPage.tsx`): full-form lookup for every abbreviation used in the app, grouped by category (Entry Schemes / SSB & Psychology / Written Exam / General).

Both pages carry a local secondary nav (Eligibility → `/eligibility-check`, Written Prep, SSB Training, Expert Consultation).

## 10. Profile (`src/pages/ProfilePage.tsx`)

Accessible from every authenticated page via the header's "Profile" link. Shows:
- **Account**: name, masked phone, age, minor/adult + guardian-consent status, guardian name/phone if applicable.
- **Your Path**: current path (School/Graduate/SSB Only) with a description, and the same "Change Your Path" pill control Home (§4) has.
- **Subscriptions**: per-track status badge (Not Started / Trial Active / Subscribed) for NDA/CDS/AFCAT written prep and SSB training, with a trial-start link where not yet started, and the existing-member discount note where relevant. Starting a trial also logs an aggregate event (exam/scope only, nothing tied to the candidate's phone) visible on the owner-only `/admin/stats` dashboard — same non-per-user-profile treatment as AI Assist usage, see §12.
- **Sign Out**: logs out of this device and deletes nothing. Progress is saved against the candidate's mobile number, so signing back in with it resumes exactly where they left off, while anyone signing in with a different number gets their own clean start and never sees the previous candidate's details. The copy states both halves of that guarantee (see Technical Brief §3–4).

## 11. Shared Header (`src/components/layout/AppHeader.tsx`)

On every authenticated page: logo → page label → Eligibility Check / Help / Glossary / Profile links (grouped together so they wrap as one unit on narrow screens) → page-specific slot (e.g. the onboarding stepper, exam tabs).

## 12. AI Assist (`src/components/ai/AiAssistChat.tsx`)

Two surfaces share this component, both backed by a real call to Claude (`server/src/routes/ai.ts`, `POST /ai/ask`) rather than canned text:

- **SSB Assistant** (`AiAssistantBonus.tsx`, free bonus module): explains OLQs, rubrics, and response structure for WAT/TAT/SRT/PPDT/interview prep. 3 free questions in trial, unlimited once subscribed.
- **Current Affairs Digest Assist** (`CurrentAffairsDigest.tsx`): answers questions about a specific news brief, with that brief's title/detail sent along as context so answers stay on-topic. Same 3-free/unlimited cap.

Both surfaces show a "Thinking…" state while the request is in flight and an inline error message if the call fails (network issue or the assistant being temporarily unavailable) — a failed call doesn't count against the free-question cap. **Non-negotiable**: the backend's system prompt instructs the model to explain and coach only — it will not score, grade, or give a pass/fail verdict on a candidate's own WAT/TAT/SRT/PPDT/interview response even if the candidate pastes it in and asks to be scored. Only a human assessor (or Expert Consultation, §8) gives that kind of feedback.

Each successful reply is logged server-side as an aggregate event (surface only — no phone number, no question or answer text) so real adoption of the feature is visible on the owner-only `/admin/stats` dashboard (see Technical Brief §6). Candidates never see this dashboard or know it exists beyond the general analytics disclosure in the login sequence's consent copy.
