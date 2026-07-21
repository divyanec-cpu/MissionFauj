const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface SendOtpResult {
  ok: boolean;
  reqId?: string;
  error?: string;
}

export interface OtpResult {
  ok: boolean;
  error?: string;
}

async function post<T>(path: string, body: unknown): Promise<T & { ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ...data, ok: false, error: data.error || 'Something went wrong. Try again.' };
    }
    return data;
  } catch {
    return { ok: false, error: 'Could not reach the OTP service. Check your connection and try again.' } as T & {
      ok: boolean;
      error?: string;
    };
  }
}

/** 10-digit Indian mobile, no +91 prefix — the server adds the country code. */
export function sendOtp(phone: string): Promise<SendOtpResult> {
  return post<SendOtpResult>('/api/otp/send', { phone });
}

export function resendOtp(reqId: string, via: 'text' | 'voice' = 'text'): Promise<OtpResult> {
  return post<OtpResult>('/api/otp/resend', { reqId, via });
}

export function verifyOtp(reqId: string, otp: string): Promise<OtpResult> {
  return post<OtpResult>('/api/otp/verify', { reqId, otp });
}
