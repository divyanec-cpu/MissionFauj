const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface OtpResult {
  ok: boolean;
  error?: string;
}

async function post(path: string, body: unknown): Promise<OtpResult> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Something went wrong. Try again.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the OTP service. Check your connection and try again.' };
  }
}

export function sendOtp(mobile: string) {
  return post('/api/otp/send', { mobile });
}

export function verifyOtp(mobile: string, otp: string) {
  return post('/api/otp/verify', { mobile, otp });
}

export function resendOtp(mobile: string) {
  return post('/api/otp/resend', { mobile });
}
