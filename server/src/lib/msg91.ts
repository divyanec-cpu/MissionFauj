const VERIFY_ACCESS_TOKEN_URL = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';
const REQUEST_TIMEOUT_MS = 12_000;

export class Msg91VerificationError extends Error {}

/**
 * Server-side verification is active only when MSG91_AUTH_KEY is configured.
 *
 * Without it the backend falls back to its previous behaviour — trusting the
 * client's claim that the code was verified — which is forgeable by anyone who
 * can send two HTTP requests. That fallback exists so deploying this change
 * can't take live logins down before the key is set, NOT because it's an
 * acceptable resting state. `/admin/diagnostics` reports which mode is live so
 * the weak one can't sit there unnoticed.
 */
export function isVerificationEnforced(): boolean {
  return Boolean(process.env.MSG91_AUTH_KEY?.trim());
}

/** MSG91 identifiers carry a country code (91XXXXXXXXXX); ours are 10 digits. */
function lastTenDigits(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}

function extractIdentifier(data: Record<string, unknown>): string | null {
  const direct = data.message;
  if (typeof direct === 'string' && /\d{10}/.test(direct)) return direct;
  const nested = (data.data as Record<string, unknown> | undefined)?.identifier;
  if (typeof nested === 'string' && /\d{10}/.test(nested)) return nested;
  return null;
}

/**
 * Confirms with MSG91 that `accessToken` came from a real, completed OTP
 * verification, and that it was issued for `expectedPhone` specifically.
 *
 * The identifier check is the part that carries the security property, not the
 * token's validity on its own: anyone can verify their *own* number and obtain
 * a perfectly valid token, so without comparing the identifier they could then
 * present it while claiming somebody else's number. Every failure path
 * therefore throws rather than returning — including MSG91 being unreachable
 * or answering in a shape we don't recognise.
 *
 * The deliberate cost is availability: if MSG91 is down, logins fail rather
 * than silently falling back to the unverified path. That is the right trade
 * for an auth gate, but it does mean their outage becomes our outage.
 */
export async function assertOtpVerifiedWithMsg91(accessToken: string, expectedPhone: string): Promise<void> {
  const authkey = process.env.MSG91_AUTH_KEY?.trim();
  if (!authkey) throw new Msg91VerificationError('MSG91_AUTH_KEY is not configured on the server.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let data: Record<string, unknown>;
  try {
    const res = await fetch(VERIFY_ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authkey, 'access-token': accessToken }),
      signal: controller.signal,
    });
    // MSG91 answers 200 even when rejecting credentials, so the body is what
    // matters here, never the status code.
    data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  } catch {
    throw new Msg91VerificationError('Could not reach MSG91 to confirm the code. Please try again in a moment.');
  } finally {
    clearTimeout(timeout);
  }

  if (data.type !== 'success') {
    const detail = typeof data.message === 'string' ? data.message : 'verification was rejected';
    throw new Msg91VerificationError(`MSG91 did not confirm this code (${detail}).`);
  }

  const identifier = extractIdentifier(data);
  if (!identifier) {
    // Success without an identifier means we can't prove *whose* number was
    // verified, which is the whole point — so this fails closed rather than
    // accepting a token that might belong to someone else's phone.
    throw new Msg91VerificationError('MSG91 confirmed the code but did not return which number it belonged to.');
  }

  if (lastTenDigits(identifier) !== lastTenDigits(expectedPhone)) {
    throw new Msg91VerificationError('This code was verified for a different mobile number.');
  }
}
