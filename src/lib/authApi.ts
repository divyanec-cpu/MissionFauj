const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 15_000;

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    // A slow/unstable connection must surface as an error, not hang the
    // calling button's "loading" state forever with no feedback.
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw new Error('Could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.');
  }
  return data as T;
}

export type OtpPurpose = 'candidate' | 'guardian';

export const CONSENT_VERSION = 'v1';

// Bookkeeping only — the actual OTP send happens client-side against MSG91
// directly (see msg91Client.ts). This just tells our backend a send was
// initiated, so verify-otp below has a freshness check to require.
export function registerOtpSent(phone: string, purpose: OtpPurpose, reqId: string) {
  return post<{ ok: true }>('/auth/otp-sent', { phone, purpose, reqId });
}

// The client has already verified the code directly with MSG91 before
// calling this — it only asks our backend for the session token, it does
// not send the code here.
export function verifyOtp(phone: string, purpose: OtpPurpose) {
  return post<{ token: string }>('/auth/verify-otp', { phone, purpose });
}

export function confirmAge(token: string, dobDay: number, dobMonth: number, dobYear: number) {
  return post<{ token: string; age: number; isMinor: boolean }>('/auth/confirm-age', {
    token,
    dobDay,
    dobMonth,
    dobYear,
  });
}

export function acceptConsent(payload: {
  ageToken: string;
  guardianToken?: string;
  guardianName?: string;
  consentVersion: string;
}) {
  return post<{ ok: true; id: string }>('/auth/consent', payload);
}
