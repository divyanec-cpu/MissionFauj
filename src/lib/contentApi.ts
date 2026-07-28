import type { Expert } from '../data/experts';
import type { DigestPost } from '../data/digestPosts';
import type { PricingPlan } from '../data/pricingPlans';
import type { SchemeRule } from '../types/schemes';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const REQUEST_TIMEOUT_MS = 15_000;

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw new Error('Could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) throw new Error('Something went wrong. Please try again.');
  return (await res.json()) as T;
}

export function fetchExperts() {
  return get<{ experts: Expert[] }>('/content/experts').then((d) => d.experts);
}

export function fetchDigestPosts() {
  return get<{ posts: DigestPost[] }>('/content/digest-posts').then((d) => d.posts);
}

export function fetchPricingPlans(scope: 'written' | 'ssb') {
  return get<{ plans: PricingPlan[] }>(`/content/pricing-plans?scope=${scope}`).then((d) => d.plans);
}

export function fetchEligibilityRules() {
  return get<{ rules: SchemeRule[] }>('/content/eligibility-rules').then((d) => d.rules);
}

export type SubscriptionEventKind = 'written_trial' | 'written_subscribed' | 'ssb_trial' | 'ssb_subscribed';

// Fire-and-forget — an aggregate adoption signal, never blocks the actual
// trial/subscribe action, and a failure here is never surfaced to the user.
export function trackSubscriptionEvent(kind: SubscriptionEventKind, exam?: 'NDA' | 'CDS' | 'AFCAT'): void {
  fetch(`${API_BASE}/content/track-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, exam }),
  }).catch(() => {});
}
