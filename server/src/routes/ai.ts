import { Router } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma.js';
import { byIp, global as globalKey, rateLimit } from '../lib/rateLimit.js';
import { requireCandidateSession, type CandidateRequest } from '../lib/candidateAuth.js';

export const aiRouter = Router();

const FREE_QUESTIONS = 3;

/** Which stored counter each surface spends from. */
const COUNTER_BY_SURFACE = {
  ssb: 'ssbAssistant',
  digest: 'digestAssist',
  general: 'general',
} as const;

// Rate limits still sit in front of the session check: they are the defence
// against volume, not against identity, and should reject a flood before it
// reaches token verification or the database.
//
// The per-IP limit is deliberately loose: Indian mobile carriers put large
// numbers of users behind shared CGNAT addresses, so a tight per-IP cap would
// lock out real candidates who merely share a carrier with someone else.
const AI_PER_IP = {
  name: 'ai-ask-ip',
  limit: 60,
  windowMs: 60 * 60 * 1000,
  message: 'Too many AI questions from this connection. Please wait a little while and try again.',
};

// A blunt backstop now rather than the primary control: with the free-question
// cap enforced per candidate below, ordinary use can't approach this, so
// tripping it means something is wrong rather than something is popular. Raise
// it as real usage grows; the /admin/stats AiUsageEvent counts are the number
// to size it against.
const AI_GLOBAL = {
  name: 'ai-ask-global',
  limit: 200,
  windowMs: 60 * 60 * 1000,
  message: 'The AI assistant is unusually busy right now. Please try again shortly.',
};

// Reads ANTHROPIC_API_KEY from the environment automatically.
const anthropic = new Anthropic();

// Both surfaces are explanatory/coaching only. This rule is enforced here,
// in the system prompt sent to the model — not just in client-side copy —
// so it holds even if a candidate pastes their own answer and asks to be
// scored on it.
const SSB_SYSTEM = `You are the MissionFauj SSB Assistant, helping candidates prepare for the Services Selection Board (SSB) interview process — psychology tests (TAT, WAT, SRT, Self-Description), GTO tasks, Lecturette, and the interview.

Explain concepts, OLQs (Officer Like Qualities), rubrics, and response structure. Give general coaching guidance on how a strong response is typically built.

You must NEVER:
- Score, grade, rate, rank, or give a pass/fail verdict on any answer, response, or performance the candidate shares with you.
- Assess or predict a candidate's OLQs, personality, or suitability from anything they tell you about themselves.

If a candidate pastes their own TAT/WAT/SRT/PPDT/interview response and asks "is this good" or "how would I score", decline to score it — explain what a strong response generally looks like structurally instead, and point them to their own self-review checklist.

Keep answers concise (2-4 short paragraphs at most), in plain text with no markdown headers or bullet lists.`;

// The floating assistant is reachable from every page, so it gets the SSB
// no-scoring rule too even though it is not an SSB-specific surface — a
// candidate can just as easily paste a TAT story here as into the SSB
// assistant, and the guardrail has to hold wherever the question is asked.
const GENERAL_SYSTEM = `You are the MissionFauj Assistant, helping candidates preparing for Indian defence services entry — NDA, CDS, AFCAT and other written exams, the SSB interview process, entry scheme eligibility, and the selection timeline.

Answer questions about exam syllabus and preparation strategy, what entry schemes exist and broadly who they suit, how the selection process runs end to end, and how to use the MissionFauj app itself.

You must NEVER:
- Score, grade, rate, rank, or give a pass/fail verdict on any answer, response, or performance the candidate shares with you.
- Assess or predict a candidate's OLQs, personality, or suitability from anything they tell you about themselves.
- State that a specific candidate is or is not eligible for a scheme. Eligibility depends on the current official notification, so explain the general criteria and point them to the in-app Eligibility Check and the official notification instead.

If asked something outside defence exam preparation, say briefly that you only cover MissionFauj and defence entry preparation.

Keep answers concise (2-4 short paragraphs at most), in plain text with no markdown headers or bullet lists.`;

const DIGEST_SYSTEM = `You are the MissionFauj Current Affairs Assistant, helping candidates preparing for NDA/CDS/AFCAT written exams understand a current-affairs news brief.

Explain the background, the stakeholders involved, what changed recently, and how the topic connects to broader themes examiners tend to link questions across. You are explaining and contextualizing published news, not creating new claims or making predictions.

Keep answers concise (2-4 short paragraphs at most), in plain text with no markdown headers or bullet lists.`;

const bodySchema = z.object({
  surface: z.enum(['ssb', 'digest', 'general']),
  question: z.string().trim().min(1).max(1000),
  context: z.string().trim().max(2000).optional(),
});

const SYSTEM_BY_SURFACE: Record<'ssb' | 'digest' | 'general', string> = {
  ssb: SSB_SYSTEM,
  digest: DIGEST_SYSTEM,
  general: GENERAL_SYSTEM,
};

interface StoredUsage {
  ssbAssistant?: number;
  digestAssist?: number;
  general?: number;
}

/**
 * Whether this candidate has any paid entitlement, read from what the server
 * stores rather than what the client claims. A client that simply asserted
 * "subscribed" would otherwise unlock unlimited spend for free.
 */
function isUnlocked(written: unknown, ssb: unknown): boolean {
  if (typeof ssb === 'string' && ssb !== 'none') return true;
  if (written && typeof written === 'object') {
    return Object.values(written as Record<string, unknown>).some((v) => typeof v === 'string' && v !== 'none');
  }
  return false;
}

// POST /ai/ask { surface, question, context? } -> { answer, aiUsage }
//
// The free-question cap is enforced here, against the counters in
// CandidateState, because the client-side copy was only ever a courtesy:
// clearing localStorage reset it, and calling the API directly skipped it
// entirely. The response returns the authoritative counters so the client
// reflects them rather than keeping its own tally, which would drift.
//
// Deliberately NOT counted against AiUsageEvent for enforcement: that table is
// aggregate-only and carries no phone by design (§5), and giving it one to
// enable per-candidate counting would trade the privacy property for something
// CandidateState already provides.
aiRouter.post(
  '/ask',
  rateLimit(AI_PER_IP, byIp),
  rateLimit(AI_GLOBAL, globalKey),
  requireCandidateSession,
  async (req: CandidateRequest, res) => {
    const body = bodySchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
      return;
    }
    const { surface, question, context } = body.data;
    const system = SYSTEM_BY_SURFACE[surface];
    const phone = req.candidatePhone!;
    const counter = COUNTER_BY_SURFACE[surface];

    const row = await prisma.candidateState.findUnique({ where: { candidatePhone: phone } });
    const usage = ((row?.aiUsage ?? {}) as StoredUsage) || {};
    const used = typeof usage[counter] === 'number' ? (usage[counter] as number) : 0;

    if (!isUnlocked(row?.writtenSubscriptions, row?.ssbSubscription) && used >= FREE_QUESTIONS) {
      res.status(403).json({
        error: "You've used your free questions in trial mode. Subscribe for unlimited AI Assistant access.",
        aiUsage: usage,
      });
      return;
    }
    const userContent = context ? `Context (the brief being discussed): ${context}\n\nQuestion: ${question}` : question;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 500,
        system,
        messages: [{ role: 'user', content: userContent }],
      });
      const textBlock = message.content.find((block): block is Anthropic.TextBlock => block.type === 'text');

      // Counted only after the model actually answered, so a failed call never
      // costs a candidate one of their free questions.
      const nextUsage: StoredUsage = { ...usage, [counter]: used + 1 };
      await prisma.candidateState.upsert({
        where: { candidatePhone: phone },
        create: { candidatePhone: phone, aiUsage: nextUsage as never },
        update: { aiUsage: nextUsage as never },
      });

      // Fire-and-forget: a logging hiccup shouldn't fail the actual answer.
      prisma.aiUsageEvent.create({ data: { surface } }).catch((err) => console.error('Failed to log AI usage event', err));
      res.json({
        answer: textBlock?.text ?? "Sorry, I couldn't come up with an answer to that — try rephrasing.",
        aiUsage: nextUsage,
      });
    } catch (err) {
      console.error(err);
      res.status(502).json({ error: 'AI assistant is temporarily unavailable. Please try again in a moment.' });
    }
  },
);
