// lib/utils/rate-limit.ts
// In-memory rate limiting for API endpoints
// Limits requests to LIMIT per WINDOW_MS per IP address

const WINDOW_MS = 60_000 // 1 minute window
const LIMIT = 10 // 10 requests per minute per IP
const store = new Map<string, { count: number; reset: number }>()

export function rateLimit(ip: string): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const rec = store.get(ip)

  // No record or window expired - start fresh
  if (!rec || rec.reset < now) {
    store.set(ip, { count: 1, reset: now + WINDOW_MS })
    return { ok: true }
  }

  // Hit limit - deny request
  if (rec.count >= LIMIT) {
    return { ok: false, retryAfterMs: rec.reset - now }
  }

  // Within limit - increment and allow
  rec.count += 1
  return { ok: true }
}
