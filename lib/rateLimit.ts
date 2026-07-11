// Qawla — In-memory rate limiter (sliding window per identifier + route preset)
// Designed for Cloudflare Workers isolate-local memory. For multi-isolate
// precision, back this with Durable Objects or KV — here we keep it simple.

export type RateLimitPreset = 'auth' | 'checkout' | 'ingest' | 'pipeline' | 'read' | 'api';

interface LimitConfig {
  windowMs: number;
  maxRequests: number;
}

const PRESETS: Record<RateLimitPreset, LimitConfig> = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 / 15 min
  checkout: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 / min
  ingest: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 / min
  pipeline: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 / min
  read: { windowMs: 60 * 1000, maxRequests: 120 }, // 120 / min
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 / min
};

interface Bucket {
  timestamps: number[];
}

// Global store per isolate
const store = new Map<string, Bucket>();

// ─── Live stats counters ────────────────────────────────────────────────────
let _totalRequests = 0;
let _blockedRequests = 0;
const _perPresetStats: Record<RateLimitPreset, { total: number; blocked: number }> = {
  auth: { total: 0, blocked: 0 },
  checkout: { total: 0, blocked: 0 },
  ingest: { total: 0, blocked: 0 },
  pipeline: { total: 0, blocked: 0 },
  read: { total: 0, blocked: 0 },
  api: { total: 0, blocked: 0 },
};
const _blockedIpCounts = new Map<string, number>();

export function getRateLimitStats() {
  const topBlockedIps = Array.from(_blockedIpCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));
  return {
    totalRequests: _totalRequests,
    blockedRequests: _blockedRequests,
    perPreset: { ..._perPresetStats },
    topBlockedIps,
    lastUpdated: new Date().toISOString(),
  };
}

// GC: periodically prune expired buckets to bound memory
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGc = Date.now();

function gc(now: number) {
  if (now - lastGc < GC_INTERVAL_MS) return;
  lastGc = now;
  const cutoff = now - 60 * 60 * 1000; // 1h
  for (const [key, bucket] of store) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // ms timestamp
  retryAfterMs: number;
  limit: number;
}

export function rateLimit(
  preset: RateLimitPreset,
  identifier: string,
): RateLimitResult {
  const cfg = PRESETS[preset];
  const now = Date.now();
  gc(now);
  const key = `${preset}:${identifier}`;
  const bucket = store.get(key) ?? { timestamps: [] };
  const windowStart = now - cfg.windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  // Track stats
  _totalRequests++;
  _perPresetStats[preset].total++;

  if (bucket.timestamps.length >= cfg.maxRequests) {
    const oldest = bucket.timestamps[0];
    const resetAt = oldest + cfg.windowMs;
    store.set(key, bucket);
    // Track blocked
    _blockedRequests++;
    _perPresetStats[preset].blocked++;
    _blockedIpCounts.set(identifier, (_blockedIpCounts.get(identifier) ?? 0) + 1);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterMs: Math.max(resetAt - now, 1000),
      limit: cfg.maxRequests,
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return {
    allowed: true,
    remaining: cfg.maxRequests - bucket.timestamps.length,
    resetAt: now + cfg.windowMs,
    retryAfterMs: 0,
    limit: cfg.maxRequests,
  };
}

/** Extract a stable client identifier from a request. */
export function getClientId(req: Request): string {
  const forwarded = req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')
    ?? req.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return 'anonymous';
}

/** Build standard rate-limit headers for a 200 response. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}

/** Build a 429 response with retry-after headers. */
export function rateLimitedResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      code: 'rate_limited',
      retryAfter: Math.ceil(result.retryAfterMs / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

/** Test helper: reset store between tests */
export function _resetRateLimiter(): void {
  store.clear();
  lastGc = Date.now();
  _totalRequests = 0;
  _blockedRequests = 0;
  for (const key of Object.keys(_perPresetStats) as RateLimitPreset[]) {
    _perPresetStats[key] = { total: 0, blocked: 0 };
  }
  _blockedIpCounts.clear();
}
