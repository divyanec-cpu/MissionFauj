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

export function sendOtp(phone: string, purpose: OtpPurpose) {
  return post<{ ok: true }>('/auth/send-otp', { phone, purpose });
}

export function resendOtp(phone: string) {
  return post<{ ok: true }>('/auth/resend-otp', { phone });
}

export function verifyOtp(phone: string, otp: string, purpose: OtpPurpose) {
  return post<{ token: string }>('/auth/verify-otp', { phone, otp, purpose });
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
