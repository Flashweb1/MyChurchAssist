/**
 * In-memory rate limiter (resets on server restart / per serverless invocation).
 * For production at scale, swap the Map for Redis using @upstash/ratelimit.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
}

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowSec * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/** Extract a stable key from a request (user ID preferred, falls back to IP) */
export function getRateLimitKey(req: Request, prefix: string, userId?: string): string {
  if (userId) return `${prefix}:uid:${userId}`;
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${prefix}:ip:${ip}`;
}
