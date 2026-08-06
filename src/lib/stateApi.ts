const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 15_000;

/** Mirrors the JSON blobs in the CandidateState table; all nullable. */
export interface RemoteCandidateState {
  candidateName: unknown;
  candidatePath: unknown;
  profile: unknown;
  eligibilityResults: unknown;
  writtenSubscriptions: unknown;
  ssbSubscription: unknown;
  ssbRegistration: unknown;
  aiUsage: unknown;
  progress: unknown;
  updatedAt?: string;
}

/** Distinguishes "the server has nothing yet" from "we couldn't ask". */
export class StateUnavailableError extends Error {}

async function request(path: string, token: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
      signal: controller.signal,
    });
  } catch {
    throw new StateUnavailableError('Could not reach the server.');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns the candidate's stored state, or null when the server has none yet.
 *
 * That null is load-bearing: it means "first sync for this number", which the
 * caller answers by pushing local state up. Anything that *failed* must throw
 * instead, because treating an outage as "server has nothing" would push a
 * fresh empty device over a good stored profile.
 */
export async function fetchRemoteState(token: string): Promise<RemoteCandidateState | null> {
  const res = await request('/me/state', token, { method: 'GET' });
  if (res.status === 401) throw new StateUnavailableError('Session expired.');
  if (!res.ok) throw new StateUnavailableError('Server error.');
  const data = (await res.json().catch(() => null)) as { state: RemoteCandidateState | null } | null;
  if (!data) throw new StateUnavailableError('Malformed response.');
  return data.state;
}

export async function pushRemoteState(token: string, state: Record<string, unknown>): Promise<void> {
  const res = await request('/me/state', token, { method: 'PUT', body: JSON.stringify(state) });
  if (!res.ok) throw new StateUnavailableError('Could not save.');
}
