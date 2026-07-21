import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 4000;
const WIDGET_BASE = 'https://control.msg91.com/api/v5/widget';

class Msg91ConfigError extends Error {}
class Msg91RequestError extends Error {}

function creds() {
  const widgetId = process.env.MSG91_WIDGET_ID;
  const tokenAuth = process.env.MSG91_TOKEN_AUTH;
  if (!widgetId || !tokenAuth) {
    throw new Msg91ConfigError(
      'MSG91 is not configured. Set MSG91_WIDGET_ID and MSG91_TOKEN_AUTH (server/.env locally, or the hosting provider\'s environment settings in production).',
    );
  }
  return { widgetId, tokenAuth };
}

/** MSG91 wants the mobile number with country code and no leading "+" — e.g. 919876543210. */
function toMsg91Mobile(tenDigitPhone) {
  return `91${tenDigitPhone}`;
}

function extractError(data) {
  if (data && typeof data === 'object' && typeof data.message === 'string') return data.message;
  return 'MSG91 request failed';
}

/**
 * MSG91 has two different OTP products with different APIs:
 *   - "OTP" (classic): authkey + template_id, tracks sessions by mobile number.
 *   - "OTP Widget": widgetId + tokenAuth, tracks sessions by a `reqId` returned
 *     from the send call, which must be passed to retry/verify.
 * This account's dashboard is set up for the Widget product, so we integrate
 * against that directly, server-side — no client-embedded widget script, which
 * sidesteps that widget's own captcha requirement and internal session state
 * entirely (both were the source of every OTP bug in this app so far).
 */
async function msg91SendOtp(tenDigitPhone) {
  const { widgetId, tokenAuth } = creds();
  const mobile = toMsg91Mobile(tenDigitPhone);
  const res = await fetch(`${WIDGET_BASE}/sendOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetId, tokenAuth, identifier: mobile }),
  });
  const data = await res.json().catch(() => ({}));
  console.log('[msg91] send-otp', { mobile, status: res.status, response: data });
  if (data?.type !== 'success') throw new Msg91RequestError(extractError(data));
  // On success, MSG91's Widget API puts the reqId in the `message` field (not a
  // `reqId` field, despite what some doc snippets suggest).
  const reqId = data?.reqId ?? data?.data?.reqId ?? data?.message;
  if (!reqId) throw new Msg91RequestError('MSG91 sendOtp succeeded but returned no reqId');
  return String(reqId);
}

async function msg91ResendOtp(reqId, retryChannel = 'text') {
  const { widgetId, tokenAuth } = creds();
  const res = await fetch(`${WIDGET_BASE}/retryOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetId, tokenAuth, reqId, retryChannel }),
  });
  const data = await res.json().catch(() => ({}));
  console.log('[msg91] retry-otp', { reqId, status: res.status, response: data });
  if (data?.type !== 'success') throw new Msg91RequestError(extractError(data));
}

async function msg91VerifyOtp(reqId, otp) {
  const { widgetId, tokenAuth } = creds();
  const res = await fetch(`${WIDGET_BASE}/verifyOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ widgetId, tokenAuth, reqId, otp }),
  });
  const data = await res.json().catch(() => ({}));
  console.log('[msg91] verify-otp', { reqId, status: res.status, response: data });
  return data?.type === 'success';
}

if (!process.env.MSG91_WIDGET_ID || !process.env.MSG91_TOKEN_AUTH) {
  console.warn(
    '[missionfauj-otp-server] MSG91_WIDGET_ID / MSG91_TOKEN_AUTH are not set — copy .env.example to .env and fill them in before sending real OTPs.',
  );
}

const app = express();
app.use(cors());
app.use(express.json());

function handleMsg91Error(err, res) {
  if (err instanceof Msg91ConfigError) return res.status(503).json({ ok: false, error: err.message });
  if (err instanceof Msg91RequestError) return res.status(502).json({ ok: false, error: err.message });
  console.error('[missionfauj-otp-server] unexpected error', err);
  res.status(500).json({ ok: false, error: 'Something went wrong. Try again.' });
}

const PHONE_RE = /^[6-9]\d{9}$/;
const OTP_RE = /^\d{4,8}$/;

// POST /api/otp/send { phone } -> { ok, reqId }
app.post('/api/otp/send', async (req, res) => {
  const phone = String(req.body?.phone || '');
  if (!PHONE_RE.test(phone)) return res.status(400).json({ ok: false, error: 'Invalid Indian mobile number.' });
  try {
    const reqId = await msg91SendOtp(phone);
    res.json({ ok: true, reqId });
  } catch (err) {
    handleMsg91Error(err, res);
  }
});

// POST /api/otp/resend { reqId, via } -> { ok }
app.post('/api/otp/resend', async (req, res) => {
  const reqId = String(req.body?.reqId || '');
  if (!reqId) return res.status(400).json({ ok: false, error: 'Missing reqId — send an OTP first.' });
  try {
    await msg91ResendOtp(reqId, req.body?.via === 'voice' ? 'voice' : 'text');
    res.json({ ok: true });
  } catch (err) {
    handleMsg91Error(err, res);
  }
});

// POST /api/otp/verify { reqId, otp } -> { ok }
app.post('/api/otp/verify', async (req, res) => {
  const reqId = String(req.body?.reqId || '');
  const otp = String(req.body?.otp || '');
  if (!reqId) return res.status(400).json({ ok: false, error: 'Missing reqId — send an OTP first.' });
  if (!OTP_RE.test(otp)) return res.status(400).json({ ok: false, error: 'Invalid code.' });
  try {
    const verified = await msg91VerifyOtp(reqId, otp);
    if (!verified) return res.status(401).json({ ok: false, error: 'Incorrect or expired code.' });
    res.json({ ok: true });
  } catch (err) {
    handleMsg91Error(err, res);
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[missionfauj-otp-server] listening on http://localhost:${PORT}`);
});
