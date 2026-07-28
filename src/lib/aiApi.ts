const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 30_000;

export type AiSurface = 'ssb' | 'digest';

export async function askAi(surface: AiSurface, question: string, context?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.');
  }
  return data.answer as string;
}
