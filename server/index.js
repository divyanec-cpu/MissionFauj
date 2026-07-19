import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 4000;
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID;
const MSG91_BASE = 'https://control.msg91.com/api/v5/otp';

if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
  console.warn(
    '[missionfauj-otp-server] MSG91_AUTH_KEY / MSG91_OTP_TEMPLATE_ID are not set — copy .env.example to .env and fill them in before sending real OTPs.',
  );
}

const app = express();
app.use(cors());
app.use(express.json());

/** Indian mobile in our stored "+91XXXXXXXXXX" format -> MSG91's "91XXXXXXXXXX" (no plus). */
function toMsg91Mobile(mobile) {
  return String(mobile).replace(/^\+/, '');
}

function isValidStoredMobile(mobile) {
  return /^\+91[6-9]\d{9}$/.test(String(mobile || ''));
}

/**
 * MSG91's v5 OTP endpoints aren't fully consistent with each other:
 * - SendOTP:  POST .../otp?template_id=&mobile=&authkey=      (authkey in the query string)
 * - Verify:   GET  .../otp/verify?otp=&mobile=  + header authkey
 * - Resend:   GET  .../otp/retry?authkey=&retrytype=&mobile=  (authkey in the query string)
 * See https://docs.msg91.com/otp for the current per-endpoint spec.
 */
async function msg91Request({ path, method, query, authAsHeader }) {
  const url = new URL(`${MSG91_BASE}${path}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const headers = { 'Content-Type': 'application/json' };
  if (authAsHeader) headers.authkey = MSG91_AUTH_KEY;
  const res = await fetch(url, { method, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.type !== 'error', data };
}

app.post('/api/otp/send', async (req, res) => {
  const { mobile } = req.body || {};
  if (!isValidStoredMobile(mobile)) {
    return res.status(400).json({ ok: false, error: 'Invalid Indian mobile number.' });
  }
  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    return res.status(503).json({ ok: false, error: 'OTP service is not configured on the server yet.' });
  }
  try {
    const { ok, data } = await msg91Request({
      path: '',
      method: 'POST',
      query: { template_id: MSG91_TEMPLATE_ID, mobile: toMsg91Mobile(mobile), authkey: MSG91_AUTH_KEY },
    });
    if (!ok) return res.status(502).json({ ok: false, error: data.message || 'Failed to send OTP.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('send OTP error', err);
    res.status(502).json({ ok: false, error: 'Could not reach the SMS provider.' });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  const { mobile, otp } = req.body || {};
  if (!isValidStoredMobile(mobile) || !/^\d{4,6}$/.test(String(otp || ''))) {
    return res.status(400).json({ ok: false, error: 'Invalid mobile or code.' });
  }
  if (!MSG91_AUTH_KEY) {
    return res.status(503).json({ ok: false, error: 'OTP service is not configured on the server yet.' });
  }
  try {
    const { ok, data } = await msg91Request({
      path: '/verify',
      method: 'GET',
      query: { mobile: toMsg91Mobile(mobile), otp: String(otp) },
      authAsHeader: true,
    });
    if (!ok) return res.status(401).json({ ok: false, error: data.message || 'Incorrect or expired code.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('verify OTP error', err);
    res.status(502).json({ ok: false, error: 'Could not reach the SMS provider.' });
  }
});

app.post('/api/otp/resend', async (req, res) => {
  const { mobile, via } = req.body || {};
  if (!isValidStoredMobile(mobile)) {
    return res.status(400).json({ ok: false, error: 'Invalid Indian mobile number.' });
  }
  if (!MSG91_AUTH_KEY) {
    return res.status(503).json({ ok: false, error: 'OTP service is not configured on the server yet.' });
  }
  try {
    const { ok, data } = await msg91Request({
      path: '/retry',
      method: 'GET',
      query: {
        mobile: toMsg91Mobile(mobile),
        authkey: MSG91_AUTH_KEY,
        retrytype: via === 'voice' ? 'voice' : 'text',
      },
    });
    if (!ok) return res.status(502).json({ ok: false, error: data.message || 'Failed to resend OTP.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('resend OTP error', err);
    res.status(502).json({ ok: false, error: 'Could not reach the SMS provider.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[missionfauj-otp-server] listening on http://localhost:${PORT}`);
});
