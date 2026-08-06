import type { AiUsage } from '../types/subscription';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 30_000;

export type AiSurface = 'ssb' | 'digest' | 'general';

export interface AiAnswer {
  answer: string;
  /** Authoritative counters from the server; the client mirrors rather than
   *  keeps its own tally, so the two can't drift. */
  aiUsage?: Partial<AiUsage>;
}

/** The free-question cap was reached — distinct from a transport failure, so
 *  the caller can show the subscribe prompt instead of an error. */
export class AiLimitReachedError extends Error {
  aiUsage?: Partial<AiUsage>;
  constructor(message: string, aiUsage?: Partial<AiUsage>) {
    super(message);
    this.aiUsage = aiUsage;
  }
}

/**
 * `token` is the candidate session issued at the end of sign-in. The endpoint
 * requires it: the cap is enforced per candidate server-side now, which it
 * cannot do without knowing who is asking.
 */
export async function askAi(
  surface: AiSurface,
  question: string,
  token: string | null | undefined,
  context?: string,
): Promise<AiAnswer> {
  if (!token) {
    throw new Error('Sign in again to use the AI Assistant.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ surface, question, context }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The AI assistant is taking too long to respond. Please try again.');
    }
    throw new Error('Could not reach the AI assistant. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 403) {
    throw new AiLimitReachedError(
      typeof data?.error === 'string' ? data.error : "You've used your free questions in trial mode.",
      data?.aiUsage,
    );
  }
  if (res.status === 401) {
    throw new Error('Your session has expired. Sign in again to use the AI Assistant.');
  }
  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.');
  }

  return { answer: data.answer as string, aiUsage: data.aiUsage };
}
