const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface OtpResult {
  ok: boolean;
  error?: string;
}

/**
 * The OTP Widget verifies the code directly with MSG91 client-side and hands back a JWT
 * access-token. We still confirm that token with our own server (which holds the secret
 * Auth Key) before trusting the phone number as verified — a client could otherwise fake
 * the widget's success callback without ever completing real OTP entry.
 */
export async function verifyWidgetToken(accessToken: string): Promise<OtpResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/otp/verify-widget-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Could not verify the code. Try again.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the verification service. Check your connection and try again.' };
  }
}
