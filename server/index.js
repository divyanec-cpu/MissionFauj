import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 4000;
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WIDGET_BASE = 'https://api.msg91.com/api/v5/widget';

if (!MSG91_AUTH_KEY) {
  console.warn(
    '[missionfauj-otp-server] MSG91_AUTH_KEY is not set — copy .env.example to .env and fill it in before verifying widget tokens.',
  );
}

const app = express();
app.use(cors());
app.use(express.json());

/**
 * The OTP Widget itself (client-side, via widgetId + tokenAuth) sends and verifies the
 * OTP directly with MSG91. This server's only job is to confirm the JWT access-token the
 * widget hands back is genuine before we trust the phone number as verified — a malicious
 * client could otherwise fake a "success" callback without ever completing real OTP entry.
 * See https://docs.msg91.com/otp-widget/verify-access-token
 */
app.post('/api/otp/verify-widget-token', async (req, res) => {
  const { accessToken } = req.body || {};
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing access token.' });
  }
  if (!MSG91_AUTH_KEY) {
    return res.status(503).json({ ok: false, error: 'OTP service is not configured on the server yet.' });
  }
  try {
    const response = await fetch(`${MSG91_WIDGET_BASE}/verifyAccessToken`, {
      method: 'POST',
      headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'access-token': accessToken }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.type === 'error') {
      return res.status(401).json({ ok: false, error: data.message || 'Could not verify the OTP token.' });
    }
    res.json({ ok: true, identifier: data.message?.identifier });
  } catch (err) {
    console.error('verify widget token error', err);
    res.status(502).json({ ok: false, error: 'Could not reach the SMS provider.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[missionfauj-otp-server] listening on http://localhost:${PORT}`);
});
