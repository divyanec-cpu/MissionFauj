const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '';
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH || '';
const INIT_TIMEOUT_MS = 8000;

interface Msg91WidgetInitConfig {
  widgetId: string;
  tokenAuth: string;
  exposeMethods: true;
  success: (data: unknown) => void;
  failure: (error: unknown) => void;
}

declare global {
  interface Window {
    initSendOTP?: (config: Msg91WidgetInitConfig) => void;
    sendOtp?: (
      identifier: string,
      success: (data: unknown) => void,
      failure: (error: unknown) => void,
    ) => void;
    retryOtp?: (
      channel: 'text' | 'voice' | undefined,
      success: (data: unknown) => void,
      failure: (error: unknown) => void,
    ) => void;
    verifyOtp?: (
      otp: string,
      success: (data: { message?: string } | undefined) => void,
      failure: (error: unknown) => void,
    ) => void;
  }
}

export interface WidgetResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

function extractMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'Something went wrong. Try again.');
  }
  return 'Something went wrong. Try again.';
}

let initPromise: Promise<string> | null = null;

/**
 * Calling initSendOTP doesn't make window.sendOtp/retryOtp/verifyOtp available
 * synchronously — the widget sets those up asynchronously. Wait for either its own
 * success/failure callback or (as a fallback, since that callback isn't always fired
 * reliably by every widget version) for window.sendOtp to actually appear.
 * Resolves with an error string, or '' once ready.
 */
function ensureInit(): Promise<string> {
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve) => {
    if (!WIDGET_ID || !TOKEN_AUTH) {
      resolve('OTP widget is not configured yet (missing Widget ID / Token Auth).');
      return;
    }
    if (typeof window.initSendOTP !== 'function') {
      resolve('OTP widget script has not loaded. Check your connection and try again.');
      return;
    }

    let settled = false;
    const settle = (error: string) => {
      if (settled) return;
      settled = true;
      resolve(error);
    };

    window.initSendOTP({
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      exposeMethods: true,
      success: () => settle(''),
      failure: (error) => settle(extractMessage(error)),
    });

    const start = Date.now();
    const poll = () => {
      if (typeof window.sendOtp === 'function') return settle('');
      if (Date.now() - start > INIT_TIMEOUT_MS) return settle('OTP widget failed to initialize. Try again.');
      setTimeout(poll, 150);
    };
    setTimeout(poll, 150);
  });

  return initPromise;
}

export async function sendOtpWidget(identifier: string): Promise<WidgetResult> {
  const initError = await ensureInit();
  if (initError) return { ok: false, error: initError };
  return new Promise((resolve) => {
    if (typeof window.sendOtp !== 'function') return resolve({ ok: false, error: 'OTP widget is unavailable.' });
    window.sendOtp(
      identifier,
      () => resolve({ ok: true }),
      (error) => resolve({ ok: false, error: extractMessage(error) }),
    );
  });
}

export async function retryOtpWidget(channel?: 'text' | 'voice'): Promise<WidgetResult> {
  const initError = await ensureInit();
  if (initError) return { ok: false, error: initError };
  return new Promise((resolve) => {
    if (typeof window.retryOtp !== 'function') return resolve({ ok: false, error: 'OTP widget is unavailable.' });
    window.retryOtp(
      channel,
      () => resolve({ ok: true }),
      (error) => resolve({ ok: false, error: extractMessage(error) }),
    );
  });
}

export async function verifyOtpWidget(otp: string): Promise<WidgetResult<string>> {
  const initError = await ensureInit();
  if (initError) return { ok: false, error: initError };
  return new Promise((resolve) => {
    if (typeof window.verifyOtp !== 'function') return resolve({ ok: false, error: 'OTP widget is unavailable.' });
    window.verifyOtp(
      otp,
      (data) => resolve({ ok: true, data: data?.message }),
      (error) => resolve({ ok: false, error: extractMessage(error) }),
    );
  });
}
