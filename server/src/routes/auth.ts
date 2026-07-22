import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { Msg91ConfigError, Msg91RequestError, resendOtp, sendOtp, verifyOtp } from '../lib/msg91.js';
import { calendarAge, parseDob } from '../lib/age.js';
import { signAgeVerified, signPhoneVerified, verifyAgeVerified, verifyPhoneVerified } from '../lib/jwt.js';

export const authRouter = Router();

const phoneSchema = z.string().regex(/^\d{10}$/, 'phone must be exactly 10 digits');
const otpSchema = z.string().regex(/^\d{4,8}$/, 'otp must be 4-8 digits');
const purposeSchema = z.enum(['candidate', 'guardian']);

// The one consent wording every ConsentRecord in the current build refers
// to — bump this string (and the copy in Login Sequence.dc.html /
// LoginSequence.tsx) together whenever the consent text changes, so old
// records stay attributable to the wording that was actually shown.
const CONSENT_VERSION = 'v1';

function handleMsg91Error(err: unknown, res: import('express').Response) {
  if (err instanceof Msg91ConfigError) {
    res.status(503).json({ error: err.message, code: 'MSG91_NOT_CONFIGURED' });
    return;
  }
  if (err instanceof Msg91RequestError) {
    res.status(502).json({ error: err.message, code: 'MSG91_REQUEST_FAILED' });
    return;
  }
  res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
}

// POST /auth/send-otp { phone, purpose }
authRouter.post('/send-otp', async (req, res) => {
  const body = z.object({ phone: phoneSchema, purpose: purposeSchema }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  const { phone, purpose } = body.data;
  try {
    const reqId = await sendOtp(phone);
    await prisma.otpSession.upsert({
      where: { phone },
      create: { phone, reqId, purpose },
      update: { reqId, purpose },
    });
    res.json({ ok: true });
  } catch (err) {
    handleMsg91Error(err, res);
  }
});

// POST /auth/resend-otp { phone }
authRouter.post('/resend-otp', async (req, res) => {
  const body = z.object({ phone: phoneSchema }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  const session = await prisma.otpSession.findUnique({ where: { phone: body.data.phone } });
  if (!session) {
    res.status(400).json({ error: 'No OTP was sent to this number yet — go back and send one first.' });
    return;
  }
  try {
    await resendOtp(session.reqId);
    res.json({ ok: true });
  } catch (err) {
    handleMsg91Error(err, res);
  }
});

// POST /auth/verify-otp { phone, otp, purpose } -> { token }
// token proves this phone was just verified, for the next step in the same
// sitting (confirm-age for the candidate, or the consent step for a guardian)
// — it is never stored client-side beyond the current sign-up session.
authRouter.post('/verify-otp', async (req, res) => {
  const body = z.object({ phone: phoneSchema, otp: otpSchema, purpose: purposeSchema }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  const { phone, otp, purpose } = body.data;

  const session = await prisma.otpSession.findUnique({ where: { phone } });
  if (!session || session.purpose !== purpose) {
    res.status(400).json({ error: 'No OTP was sent to this number yet — go back and send one first.' });
    return;
  }

  let verified: boolean;
  try {
    verified = await verifyOtp(session.reqId, otp);
  } catch (err) {
    handleMsg91Error(err, res);
    return;
  }
  if (!verified) {
    res.status(401).json({ error: 'Incorrect or expired code' });
    return;
  }
  await prisma.otpSession.delete({ where: { phone } }).catch(() => {});

  const token = signPhoneVerified({ phone, purpose });
  res.json({ token });
});

// POST /auth/confirm-age { token, dobDay, dobMonth, dobYear } -> { token, age, isMinor }
// Candidate-only. Recomputes age server-side from the raw DOB fields — the
// client's own display of "age" is never trusted for the consent branch that
// follows this call.
authRouter.post('/confirm-age', async (req, res) => {
  const body = z
    .object({
      token: z.string(),
      dobDay: z.number().int(),
      dobMonth: z.number().int(),
      dobYear: z.number().int(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }

  let phoneVerified;
  try {
    phoneVerified = verifyPhoneVerified(body.data.token);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Invalid token' });
    return;
  }
  if (phoneVerified.purpose !== 'candidate') {
    res.status(403).json({ error: 'This token cannot confirm a candidate age.' });
    return;
  }

  let dob: Date;
  try {
    dob = parseDob(body.data.dobDay, body.data.dobMonth, body.data.dobYear);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid date of birth' });
    return;
  }
  const age = calendarAge(dob);
  if (age < 10) {
    res.status(400).json({ error: 'You must be at least 10 years old to use MissionFauj.' });
    return;
  }
  if (age > 100) {
    res.status(400).json({ error: 'That date of birth looks out of range. Please recheck it.' });
    return;
  }

  const isMinor = age < 18;
  const token = signAgeVerified({ phone: phoneVerified.phone, age, isMinor });
  res.json({ token, age, isMinor });
});

// POST /auth/consent — records the durable, versioned consent decision.
// Self-consent (18+): { ageToken, consentVersion }
// Guardian consent (candidate <18): { ageToken, guardianToken, guardianName, consentVersion }
// The API — not just the UI — refuses a 'self' consent for a phone the
// server itself computed as under 18, and refuses a guardian consent unless
// the guardian independently verified their OWN phone via OTP.
authRouter.post('/consent', async (req, res) => {
  const body = z
    .object({
      ageToken: z.string(),
      guardianToken: z.string().optional(),
      guardianName: z.string().trim().min(1).optional(),
      consentVersion: z.literal(CONSENT_VERSION),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }

  let ageVerified;
  try {
    ageVerified = verifyAgeVerified(body.data.ageToken);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Invalid token' });
    return;
  }

  if (ageVerified.isMinor) {
    if (!body.data.guardianToken || !body.data.guardianName) {
      res.status(400).json({ error: 'Guardian verification and name are required for a candidate under 18.' });
      return;
    }
    let guardianVerified;
    try {
      guardianVerified = verifyPhoneVerified(body.data.guardianToken);
    } catch (err) {
      res.status(401).json({ error: err instanceof Error ? err.message : 'Invalid guardian token' });
      return;
    }
    if (guardianVerified.purpose !== 'guardian') {
      res.status(403).json({ error: 'This token cannot record a guardian consent.' });
      return;
    }
    const record = await prisma.consentRecord.create({
      data: {
        candidatePhone: ageVerified.phone,
        role: 'guardian',
        consentVersion: body.data.consentVersion,
        guardianName: body.data.guardianName,
        guardianPhone: guardianVerified.phone,
      },
    });
    res.json({ ok: true, id: record.id });
    return;
  }

  const record = await prisma.consentRecord.create({
    data: {
      candidatePhone: ageVerified.phone,
      role: 'self',
      consentVersion: body.data.consentVersion,
    },
  });
  res.json({ ok: true, id: record.id });
});
