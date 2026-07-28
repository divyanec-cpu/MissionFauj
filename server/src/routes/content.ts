import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

// Public, read-only — this is content candidates see (Expert Consultation
// listings, Current Affairs digest, pricing, eligibility rules), now
// database-backed and admin-editable instead of static frontend data files.
export const contentRouter = Router();

contentRouter.get('/experts', async (_req, res) => {
  const rows = await prisma.expert.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  res.json({
    experts: rows.map((r) => ({
      role: r.role,
      category: r.category,
      accent: r.accent,
      name: r.name,
      credentials: r.credentials,
      bio: r.bio,
      price: r.price,
      bonus: r.bonus,
    })),
  });
});

contentRouter.get('/digest-posts', async (_req, res) => {
  const rows = await prisma.digestPost.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  res.json({
    posts: rows.map((r) => ({
      date: r.date,
      title: r.title,
      detail: r.detail,
      sourceName: r.sourceName,
      sourceUrl: r.sourceUrl,
    })),
  });
});

const scopeSchema = z.enum(['written', 'ssb']);

contentRouter.get('/pricing-plans', async (req, res) => {
  const parsed = scopeSchema.safeParse(req.query.scope);
  if (!parsed.success) {
    res.status(400).json({ error: 'query param "scope" must be "written" or "ssb"' });
    return;
  }
  const rows = await prisma.pricingPlan.findMany({
    where: { scope: parsed.data, active: true },
    orderBy: [{ sortOrder: 'asc' }],
  });
  res.json({
    plans: rows.map((r) => ({
      name: r.name,
      price: r.price,
      priceValue: r.priceValue,
      period: r.period,
      highlighted: r.highlighted,
      badge: r.badge ?? undefined,
      perks: r.perks as string[],
    })),
  });
});

contentRouter.get('/eligibility-rules', async (_req, res) => {
  const rows = await prisma.eligibilityRule.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }],
  });
  res.json({
    rules: rows.map((r) => ({
      id: r.id,
      name: r.name,
      branch: r.branch,
      ageMin: r.ageMin,
      ageMax: r.ageMax,
      education: r.education,
      requiresPCM: r.requiresPCM,
      pcmLabel: r.pcmLabel ?? undefined,
      marital: r.marital,
      requiresNCC: r.requiresNCC,
      failPriority: r.failPriority as string[],
      okReason: r.okReason,
    })),
  });
});

const trackSchema = z.object({
  kind: z.enum(['written_trial', 'written_subscribed', 'ssb_trial', 'ssb_subscribed']),
  exam: z.enum(['NDA', 'CDS', 'AFCAT']).optional(),
});

// Fire-and-forget from the frontend — aggregate adoption signal only,
// nothing tied to a phone number. Mirrors AiUsageEvent's design exactly.
contentRouter.post('/track-subscription', async (req, res) => {
  const body = trackSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  try {
    await prisma.subscriptionEvent.create({ data: { kind: body.data.kind, exam: body.data.exam } });
  } catch (err) {
    console.error('Failed to log subscription event', err);
  }
  res.status(204).end();
});
