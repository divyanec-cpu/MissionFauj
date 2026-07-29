import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireCandidateSession, type CandidateRequest } from '../lib/candidateAuth.js';

export const meRouter = Router();

meRouter.use(requireCandidateSession);

// The client owns the shape of these blobs (see the CandidateState comment in
// schema.prisma), so they're accepted as opaque JSON rather than re-validated
// field by field here — a stricter schema would have to be updated in lockstep
// with every frontend type change, and would reject a newer app version's
// state instead of storing it. Only the scalars the server treats as scalars
// are constrained, and size is capped so this can't be used as free storage.
const MAX_BLOB_CHARS = 100_000;

const stateSchema = z.object({
  candidateName: z.string().trim().max(120).nullable().optional(),
  candidatePath: z.enum(['school', 'graduate', 'ssb-only']).nullable().optional(),
  profile: z.unknown().optional(),
  eligibilityResults: z.unknown().optional(),
  writtenSubscriptions: z.unknown().optional(),
  ssbSubscription: z.string().max(40).nullable().optional(),
  ssbRegistration: z.unknown().optional(),
  aiUsage: z.unknown().optional(),
});

// GET /me/state -> { state: {...} | null }
// null means this candidate has nothing stored yet, which the client treats as
// "push what's on this device up" rather than "wipe this device" — the
// difference matters for everyone who used the app before syncing existed.
meRouter.get('/state', async (req: CandidateRequest, res) => {
  const row = await prisma.candidateState.findUnique({ where: { candidatePhone: req.candidatePhone! } });
  if (!row) {
    res.json({ state: null });
    return;
  }
  res.json({
    state: {
      candidateName: row.candidateName,
      candidatePath: row.candidatePath,
      profile: row.profile,
      eligibilityResults: row.eligibilityResults,
      writtenSubscriptions: row.writtenSubscriptions,
      ssbSubscription: row.ssbSubscription,
      ssbRegistration: row.ssbRegistration,
      aiUsage: row.aiUsage,
      updatedAt: row.updatedAt.toISOString(),
    },
  });
});

// PUT /me/state — full replace of this candidate's stored state.
//
// Last-write-wins, deliberately: the realistic conflict is the same person on
// a second device, not two people editing at once, and a merge would have to
// invent rules for which subscription or eligibility result "wins". The client
// only pushes after it has hydrated from here, so it can't clobber stored
// state with an empty local one.
meRouter.put('/state', async (req: CandidateRequest, res) => {
  const parsed = stateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid state' });
    return;
  }
  if (JSON.stringify(req.body ?? {}).length > MAX_BLOB_CHARS) {
    res.status(413).json({ error: 'That is more data than a profile should ever contain.' });
    return;
  }

  const data = {
    candidateName: parsed.data.candidateName ?? null,
    candidatePath: parsed.data.candidatePath ?? null,
    profile: (parsed.data.profile ?? null) as never,
    eligibilityResults: (parsed.data.eligibilityResults ?? null) as never,
    writtenSubscriptions: (parsed.data.writtenSubscriptions ?? null) as never,
    ssbSubscription: parsed.data.ssbSubscription ?? null,
    ssbRegistration: (parsed.data.ssbRegistration ?? null) as never,
    aiUsage: (parsed.data.aiUsage ?? null) as never,
  };

  const row = await prisma.candidateState.upsert({
    where: { candidatePhone: req.candidatePhone! },
    create: { candidatePhone: req.candidatePhone!, ...data },
    update: data,
  });

  res.json({ ok: true, updatedAt: row.updatedAt.toISOString() });
});
