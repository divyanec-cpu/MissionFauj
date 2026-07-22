import axios from 'axios';

// MSG91 has two different OTP products with different APIs:
//   - "OTP" (classic): authkey + template_id, tracks sessions by mobile number.
//   - "OTP Widget": widgetId + tokenAuth, tracks sessions by a `reqId` returned
//     from the send call, which must be passed to retry/verify.
// This account uses the Widget product, so we integrate against that.
const BASE_URL = 'https://control.msg91.com/api/v5/widget';

export class Msg91ConfigError extends Error {}
export class Msg91RequestError extends Error {}

function creds() {
  const widgetId = process.env.MSG91_WIDGET_ID;
  const tokenAuth = process.env.MSG91_TOKEN_AUTH;
  if (!widgetId || !tokenAuth) {
    throw new Msg91ConfigError(
      'MSG91 is not configured. Set the MSG91_WIDGET_ID and MSG91_TOKEN_AUTH environment variables ' +
        '(server/.env locally, or the hosting provider\'s environment settings in production).'
    );
  }
  return { widgetId, tokenAuth };
}

// MSG91 wants the mobile number with country code and no leading "+" or spaces, e.g. 919876543210.
function toMsg91Mobile(tenDigitPhone: string): string {
  return `91${tenDigitPhone}`;
}

function extractError(data: unknown): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.message === 'string') return d.message;
  }
  return 'MSG91 request failed';
}

export async function sendOtp(tenDigitPhone: string): Promise<string> {
  const { widgetId, tokenAuth } = creds();
  const mobile = toMsg91Mobile(tenDigitPhone);
  try {
    const res = await axios.post(`${BASE_URL}/sendOtp`, {
      widgetId,
      tokenAuth,
      identifier: mobile,
    });
    console.log('[msg91] send-otp', { mobile, response: res.data });
    if (res.data?.type !== 'success') {
      throw new Msg91RequestError(extractError(res.data));
    }
    // On success, MSG91's Widget API puts the reqId in the `message` field
    // (not a `reqId` field, despite what the docs snippets suggest) - confirmed
    // from a live response: { message: "<reqId>", type: "success" }.
    const reqId = res.data?.reqId ?? res.data?.data?.reqId ?? res.data?.message;
    if (!reqId) {
      throw new Msg91RequestError('MSG91 sendOtp succeeded but returned no reqId');
    }
    return String(reqId);
  } catch (err) {
    if (err instanceof Msg91RequestError) throw err;
    const data = axios.isAxiosError(err) ? err.response?.data : undefined;
    console.error('[msg91] send-otp failed', { mobile, status: axios.isAxiosError(err) ? err.response?.status : undefined, data });
    throw new Msg91RequestError(data ? extractError(data) : err instanceof Error ? err.message : String(err));
  }
}

export async function resendOtp(reqId: string, retryChannel: 'text' | 'voice' = 'text'): Promise<void> {
  const { widgetId, tokenAuth } = creds();
  try {
    const res = await axios.post(`${BASE_URL}/retryOtp`, {
      widgetId,
      tokenAuth,
      reqId,
      retryChannel,
    });
    console.log('[msg91] retry-otp', { reqId, response: res.data });
    if (res.data?.type !== 'success') {
      throw new Msg91RequestError(extractError(res.data));
    }
  } catch (err) {
    if (err instanceof Msg91RequestError) throw err;
    const data = axios.isAxiosError(err) ? err.response?.data : undefined;
    console.error('[msg91] retry-otp failed', { reqId, status: axios.isAxiosError(err) ? err.response?.status : undefined, data });
    throw new Msg91RequestError(data ? extractError(data) : err instanceof Error ? err.message : String(err));
  }
}

export async function verifyOtp(reqId: string, code: string): Promise<boolean> {
  const { widgetId, tokenAuth } = creds();
  try {
    const res = await axios.post(`${BASE_URL}/verifyOtp`, {
      widgetId,
      tokenAuth,
      reqId,
      otp: code,
    });
    console.log('[msg91] verify-otp', { reqId, response: res.data });
    return res.data?.type === 'success';
  } catch (err) {
    const data = axios.isAxiosError(err) ? err.response?.data : undefined;
    if (data) {
      console.error('[msg91] verify-otp rejected', { reqId, status: axios.isAxiosError(err) ? err.response?.status : undefined, data });
      // MSG91 returns an error type/4xx for wrong/expired OTPs — treat as "not verified", not a hard failure.
      return false;
    }
    throw new Msg91RequestError(err instanceof Error ? err.message : String(err));
  }
}
