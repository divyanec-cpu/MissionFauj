const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
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
