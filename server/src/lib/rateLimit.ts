import type { NextFunction, Request, Response } from 'express';

/**
 * A small fixed-window rate limiter held in process memory. No new dependency
 * and no Redis, which is the right size for a single Render instance.
 *
 * Two honest limitations, both acceptable here but not elsewhere:
 *   - Counters live in memory, so they reset whenever the service restarts or
 *     wakes from Render's free-tier sleep. This bounds sustained abuse, not a
 *     short burst timed against a restart.
 *   - They are per-instance. If this ever runs on more than one instance the
 *     effective limit multiplies by the instance count, and it would need a
 *     shared store to stay meaningful.
 */

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimitRule {
  /** Distinguishes buckets sharing a key, e.g. the same IP across two routes. */
  name: string;
  limit: number;
  windowMs: number;
  /** Sent to the client on rejection; surfaced directly in the UI. */
  message: string;
}

// Keys derive from client-controlled values (phone) and semi-trusted ones (IP),
// so the map has to stay bounded or a flood of distinct keys becomes a memory
// exhaustion vector in its own right.
const MAX_TRACKED_KEYS = 20_000;

const buckets = new Map<string, Entry>();

function sweep(now: number) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size <= MAX_TRACKED_KEYS) return;
  // Still over the cap after dropping expired entries: evict the ones closest
  // to expiring, since they'd lapse soonest anyway. This does mean a flood of
  // junk keys can prematurely clear a real counter — bounded memory is worth
  // more than a perfectly durable count at this scale.
  const byExpiry = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  for (const [key] of byExpiry.slice(0, buckets.size - MAX_TRACKED_KEYS)) {
    buckets.delete(key);
  }
}

export function consume(rule: RateLimitRule, key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  sweep(now);

  const bucketKey = `${rule.name}:${key}`;
  const entry = buckets.get(bucketKey);

  if (!entry || entry.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > rule.limit) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Express middleware for one rule. `keyOf` returning null means "nothing to key
 * on" — the request passes through so the route's own schema validation can
 * produce a proper 400 rather than this masking it as a 429.
 */
export function rateLimit(rule: RateLimitRule, keyOf: (req: Request) => string | null) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyOf(req);
    if (key === null) {
      next();
      return;
    }
    const { allowed, retryAfterSec } = consume(rule, key);
    if (!allowed) {
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({ error: rule.message });
      return;
    }
    next();
  };
}

/** req.ip is trustworthy here only because index.ts sets `trust proxy`. */
export function byIp(req: Request): string {
  return req.ip ?? 'unknown';
}

/** Everyone shares one counter — used to cap total spend, not per-user abuse. */
export function global(): string {
  return 'all';
}

export function byPhone(req: Request): string | null {
  const phone = (req.body as { phone?: unknown } | undefined)?.phone;
  return typeof phone === 'string' && /^\d{10}$/.test(phone) ? phone : null;
}
