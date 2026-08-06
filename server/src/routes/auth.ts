import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { calendarAge, parseDob } from '../lib/age.js';
import {
  signAgeVerified,
  signCandidateSession,
  signPhoneVerified,
  verifyAgeVerified,
  verifyPhoneVerified,
} from '../lib/jwt.js';
import { byIp, byPhone, rateLimit } from '../lib/rateLimit.js';
import { assertOtpVerifiedWithMsg91, isVerificationEnforced, Msg91VerificationError } from '../lib/msg91.js';

export const authRouter = Router();

// Neither of these endpoints can currently prove the caller owns the number
// they're claiming (see Technical Brief §7), so anyone can mint phone-verified
// tokens and write ConsentRecord rows for numbers that aren't theirs — which
// forges a DPDP consent record and inflates the unique-signup count on
// /admin/stats. Rate limiting doesn't fix that; only server-authoritative OTP
// verification does. It just puts a ceiling on how much junk one caller can
// produce in the meantime.
//
// Both keyings are needed and catch different abuse: per-phone stops one
// number being hammered, per-IP stops one caller working through many numbers.
// The IP limits stay loose because of carrier-level CGNAT (see ai.ts).
const HOUR_MS = 60 * 60 * 1000;

const OTP_SENT_PER_PHONE = {
  name: 'otp-sent-phone',
  limit: 5,
  windowMs: HOUR_MS,
  message: 'Too many codes requested for this number. Please wait a while before trying again.',
};

const OTP_SENT_PER_IP = {
  name: 'otp-sent-ip',
  limit: 30,
  windowMs: HOUR_MS,
  message: 'Too many sign-in attempts from this connection. Please wait a while and try again.',
};

const VERIFY_PER_PHONE = {
  name: 'verify-otp-phone',
  limit: 10,
  windowMs: HOUR_MS,
  message: 'Too many verification attempts for this number. Please wait a while before trying again.',
};

const VERIFY_PER_IP = {
  name: 'verify-otp-ip',
  limit: 30,
  windowMs: HOUR_MS,
  message: 'Too many sign-in attempts from this connection. Please wait a while and try again.',
};

const phoneSchema = z.string().regex(/^\d{10}$/, 'phone must be exactly 10 digits');
const purposeSchema = z.enum(['candidate', 'guardian']);

// OTP session bookkeeping is only a "was a code recently requested for this
// number" freshness gate — it is NOT itself proof of the correct code, since
// send/verify with MSG91 happen client-side now (see note on /verify-otp
// below for why). Stale rows outside this window can't be used to finish
// verification, so a half-abandoned flow can't be replayed much later.
const OTP_SESSION_TTL_MS = 15 * 60 * 1000;

// The one consent wording every ConsentRecord in the current build refers
// to — bump this string (and the copy in Login Sequence.dc.html /
// LoginSequence.tsx) together whenever the consent text changes, so old
// records stay attributable to the wording that was actually shown.
const CONSENT_VERSION = 'v1';

// POST /auth/otp-sent { phone, purpose, reqId }
// Called by the client right after IT sends the OTP directly to MSG91
// (server-to-server calls from Render get intermittently IP-blocked by
// MSG91's widget anti-abuse layer — see git history — so send/resend/verify
// all run client-side now, using the user's own network). This endpoint is
// bookkeeping only: it does not talk to MSG91, it just records that a send
// was initiated, so /verify-otp below has something to check freshness
// against instead of accepting a bare claim out of nowhere.
authRouter.post('/otp-sent', rateLimit(OTP_SENT_PER_IP, byIp), rateLimit(OTP_SENT_PER_PHONE, byPhone), async (req, res) => {
  const body = z.object({ phone: phoneSchema, purpose: purposeSchema, reqId: z.string().min(1) }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  const { phone, purpose, reqId } = body.data;
  await prisma.otpSession.upsert({
    where: { phone },
    create: { phone, reqId, purpose },
    update: { reqId, purpose },
  });
  res.json({ ok: true });
});

// POST /auth/verify-otp { phone, purpose, accessToken? } -> { token }
// The browser completes send + verify directly against MSG91 before calling
// this (browser-to-MSG91, not through this backend) and forwards the access
// token MSG91 hands back on success.
//
// With MSG91_AUTH_KEY configured, that token is checked with MSG91 and must
// belong to this exact phone number before any token is issued — the code is
// then genuinely proven, not merely claimed. Without the key the endpoint
// falls back to the old freshness-only check, which a caller can forge; that
// path exists solely so shipping this couldn't break live logins before the
// key was set, and the mode in force is reported on /admin/diagnostics.
authRouter.post('/verify-otp', rateLimit(VERIFY_PER_IP, byIp), rateLimit(VERIFY_PER_PHONE, byPhone), async (req, res) => {
  const body = z
    .object({ phone: phoneSchema, purpose: purposeSchema, accessToken: z.string().min(1).optional() })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  const { phone, purpose, accessToken } = body.data;

  const session = await prisma.otpSession.findUnique({ where: { phone } });
  const isFresh = !!session && Date.now() - session.updatedAt.getTime() <= OTP_SESSION_TTL_MS;
  if (!session || session.purpose !== purpose || !isFresh) {
    res.status(400).json({ error: 'No OTP was sent to this number recently — go back and send one first.' });
    return;
  }

  // No fallback branch. Verification is confirmed with MSG91 or it does not
  // happen — a missing key is a misconfiguration to fix, not a reason to start
  // trusting the client again. The earlier fallback existed only so deploying
  // this couldn't break live sign-in before the key was set; the key is set and
  // confirmed working in production, so the weak path is now unreachable rather
  // than merely unused.
  if (!isVerificationEnforced()) {
    console.error(
      '[auth] MSG91_AUTH_KEY is not set — sign-in is refused rather than falling back to trusting the client. ' +
        'Set it in this environment (see /admin/diagnostics).',
    );
    res.status(503).json({ error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
    return;
  }

  if (!accessToken) {
    res.status(400).json({ error: 'This app version is out of date. Please reload and sign in again.' });
    return;
  }

  try {
    await assertOtpVerifiedWithMsg91(accessToken, phone);
  } catch (err) {
    // The bookkeeping row is deliberately left in place on failure: deleting it
    // would force a legitimate user whose verification hit a transient MSG91
    // error to request an entirely new code.
    const message = err instanceof Msg91VerificationError ? err.message : 'Could not confirm this code.';
    res.status(401).json({ error: message });
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
    res.json({ ok: true, id: record.id, sessionToken: signCandidateSession({ phone: ageVerified.phone }) });
    return;
  }

  const record = await prisma.consentRecord.create({
    data: {
      candidatePhone: ageVerified.phone,
      role: 'self',
      consentVersion: body.data.consentVersion,
    },
  });
  res.json({ ok: true, id: record.id, sessionToken: signCandidateSession({ phone: ageVerified.phone }) });
});
