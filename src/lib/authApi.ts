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

// The client has already verified the code directly with MSG91 before calling
// this — the raw code is never sent here. `accessToken` is MSG91's proof that
// the verification actually happened, which the backend re-checks with MSG91
// and requires to match this phone number. It's optional in the signature only
// because MSG91 might not return one; the backend rejects a missing token
// whenever server-side enforcement is active.
export function verifyOtp(phone: string, purpose: OtpPurpose, accessToken?: string | null) {
  return post<{ token: string }>('/auth/verify-otp', {
    phone,
    purpose,
    ...(accessToken ? { accessToken } : {}),
  });
}

export function confirmAge(token: string, dobDay: number, dobMonth: number, dobYear: number) {
  return post<{ token: string; age: number; isMinor: boolean }>('/auth/confirm-age', {
    token,
    dobDay,
    dobMonth,
    dobYear,
  });
}

// Returns the candidate's durable session token alongside the consent record —
// this is the only point in the flow where the server has proven both who the
// candidate is and that they have consented, so it's where the session begins.
export function acceptConsent(payload: {
  ageToken: string;
  guardianToken?: string;
  guardianName?: string;
  consentVersion: string;
}) {
  return post<{ ok: true; id: string; sessionToken?: string }>('/auth/consent', payload);
}
