const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '';
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH || '';

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

let initialized = false;
let initError = '';

function ensureInit() {
  if (initialized || initError) return;
  if (!WIDGET_ID || !TOKEN_AUTH) {
    initError = 'OTP widget is not configured yet (missing Widget ID / Token Auth).';
    return;
  }
  if (typeof window.initSendOTP !== 'function') {
    initError = 'OTP widget script has not loaded. Check your connection and try again.';
    return;
  }
  window.initSendOTP({
    widgetId: WIDGET_ID,
    tokenAuth: TOKEN_AUTH,
    exposeMethods: true,
    success: () => {},
    failure: () => {},
  });
  initialized = true;
}

function extractMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'Something went wrong. Try again.');
  }
  return 'Something went wrong. Try again.';
}

export function sendOtpWidget(identifier: string): Promise<WidgetResult> {
  ensureInit();
  return new Promise((resolve) => {
    if (initError) return resolve({ ok: false, error: initError });
    if (typeof window.sendOtp !== 'function') return resolve({ ok: false, error: 'OTP widget is unavailable.' });
    window.sendOtp(
      identifier,
      () => resolve({ ok: true }),
      (error) => resolve({ ok: false, error: extractMessage(error) }),
    );
  });
}

export function retryOtpWidget(channel?: 'text' | 'voice'): Promise<WidgetResult> {
  return new Promise((resolve) => {
    if (typeof window.retryOtp !== 'function') return resolve({ ok: false, error: 'OTP widget is unavailable.' });
    window.retryOtp(
      channel,
      () => resolve({ ok: true }),
      (error) => resolve({ ok: false, error: extractMessage(error) }),
    );
  });
}

export function verifyOtpWidget(otp: string): Promise<WidgetResult<string>> {
  return new Promise((resolve) => {
    if (typeof window.verifyOtp !== 'function') return resolve({ ok: false, error: 'OTP widget is unavailable.' });
    window.verifyOtp(
      otp,
      (data) => resolve({ ok: true, data: data?.message }),
      (error) => resolve({ ok: false, error: extractMessage(error) }),
    );
  });
}
