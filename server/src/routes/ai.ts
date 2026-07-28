import { Router } from 'express';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma.js';

export const aiRouter = Router();

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

const DIGEST_SYSTEM = `You are the MissionFauj Current Affairs Assistant, helping candidates preparing for NDA/CDS/AFCAT written exams understand a current-affairs news brief.

Explain the background, the stakeholders involved, what changed recently, and how the topic connects to broader themes examiners tend to link questions across. You are explaining and contextualizing published news, not creating new claims or making predictions.

Keep answers concise (2-4 short paragraphs at most), in plain text with no markdown headers or bullet lists.`;

const bodySchema = z.object({
  surface: z.enum(['ssb', 'digest']),
  question: z.string().trim().min(1).max(1000),
  context: z.string().trim().max(2000).optional(),
});

// POST /ai/ask { surface, question, context? } -> { answer }
aiRouter.post('/ask', async (req, res) => {
  const body = bodySchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  const { surface, question, context } = body.data;
  const system = surface === 'ssb' ? SSB_SYSTEM : DIGEST_SYSTEM;
  const userContent = context ? `Context (the brief being discussed): ${context}\n\nQuestion: ${question}` : question;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: userContent }],
    });
    const textBlock = message.content.find((block): block is Anthropic.TextBlock => block.type === 'text');
    // Fire-and-forget: a logging hiccup shouldn't fail the actual answer.
    prisma.aiUsageEvent.create({ data: { surface } }).catch((err) => console.error('Failed to log AI usage event', err));
    res.json({ answer: textBlock?.text ?? "Sorry, I couldn't come up with an answer to that — try rephrasing." });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'AI assistant is temporarily unavailable. Please try again in a moment.' });
  }
});
