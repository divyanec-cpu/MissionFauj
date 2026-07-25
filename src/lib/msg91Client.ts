// Calls MSG91's OTP Widget REST API directly from the browser instead of
// through our own backend. Server-to-server calls to this same API from
// Render get intermittently IP-blocked by MSG91's widget anti-abuse layer
// (confirmed live, twice) — calling from the user's own device sidesteps
// that class of problem entirely, and MSG91 confirmed CORS-open access for
// this exact use case.
//
// widgetId/tokenAuth are meant to be embedded client-side for this product —
// this is the same pair MSG91's own hosted widget script embeds in the page
// — unlike an account Authkey, which must stay server-only.
const WIDGET_BASE = 'https://control.msg91.com/api/v5/widget';

export class Msg91ClientError extends Error {}

function creds() {
  const widgetId = import.meta.env.VITE_MSG91_WIDGET_ID;
  const tokenAuth = import.meta.env.VITE_MSG91_TOKEN_AUTH;
  if (!widgetId || !tokenAuth) {
    throw new Msg91ClientError('MSG91 is not configured for this build (VITE_MSG91_WIDGET_ID / VITE_MSG91_TOKEN_AUTH).');
  }
  return { widgetId, tokenAuth };
}

function toMsg91Mobile(tenDigitPhone: string): string {
  return `91${tenDigitPhone}`;
}

function extractError(data: unknown): string {
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).message === 'string') {
    return (data as Record<string, string>).message;
  }
  return 'Could not reach MSG91. Check your connection and try again.';
}

const REQUEST_TIMEOUT_MS = 15_000;

async function post(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${WIDGET_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    // A slow/unstable connection must surface as an error, not hang the
    // "Sending…" button state forever with no feedback.
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Msg91ClientError('Request timed out. Check your connection and try again.');
    }
    throw new Msg91ClientError('Could not reach MSG91. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
  const data = await res.json().catch(() => ({}));
  return data;
}

export async function sendOtpClient(tenDigitPhone: string): Promise<string> {
  const { widgetId, tokenAuth } = creds();
  const data = await post('/sendOtp', { widgetId, tokenAuth, identifier: toMsg91Mobile(tenDigitPhone) });
  if (data.type !== 'success') throw new Msg91ClientError(extractError(data));
  // MSG91's Widget API puts the reqId in the `message` field on success.
  const reqId = data.reqId ?? (data.data as Record<string, unknown> | undefined)?.reqId ?? data.message;
  if (!reqId) throw new Msg91ClientError('MSG91 sendOtp succeeded but returned no reqId.');
  return String(reqId);
}

export async function resendOtpClient(reqId: string, retryChannel: 'text' | 'voice' = 'text'): Promise<void> {
  const { widgetId, tokenAuth } = creds();
  const data = await post('/retryOtp', { widgetId, tokenAuth, reqId, retryChannel });
  if (data.type !== 'success') throw new Msg91ClientError(extractError(data));
}

export async function verifyOtpClient(reqId: string, otp: string): Promise<void> {
  const { widgetId, tokenAuth } = creds();
  const data = await post('/verifyOtp', { widgetId, tokenAuth, reqId, otp });
  if (data.type !== 'success') throw new Msg91ClientError(extractError(data));
}
