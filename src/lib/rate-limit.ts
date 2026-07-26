import "server-only";

/**
 * Minimal fixed-window in-memory rate limiter. Suitable for this app's
 * single-process deployment (the store itself is a local JSON file).
 * Not shared across instances — swap for Redis if the app ever scales out.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Periodically drop expired windows so the map can't grow unbounded. */
function sweep(now: number): void {
  if (buckets.size < 10_000) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true when the caller identified by `key` is within `limit`
 * requests per `windowMs`; false when the request should be rejected.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Best-effort client IP for rate-limit keys (works behind common proxies). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}
