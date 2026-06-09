// Simple in-memory token bucket rate limiter
// Note: In a serverless environment (like Vercel), this cache is isolated per Edge/Node instance
// and resets on cold boots. For a strict global rate limit, use Redis (e.g., @upstash/ratelimit).

type RateLimitStore = {
  [ip: string]: {
    tokens: number;
    lastRefill: number;
  };
};

const store: RateLimitStore = {};

export function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store[ip];

  if (!record) {
    store[ip] = {
      tokens: maxRequests - 1,
      lastRefill: now,
    };
    return true; // allowed
  }

  // Refill tokens based on time passed
  const timePassed = now - record.lastRefill;
  const tokensToAdd = Math.floor((timePassed / windowMs) * maxRequests);

  if (tokensToAdd > 0) {
    record.tokens = Math.min(maxRequests, record.tokens + tokensToAdd);
    record.lastRefill = now;
  }

  if (record.tokens > 0) {
    record.tokens -= 1;
    return true; // allowed
  }

  return false; // rejected (rate limited)
}
