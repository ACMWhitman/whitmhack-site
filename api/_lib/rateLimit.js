import { redis } from './redis.js'

const WINDOW_SECONDS = 15 * 60
const MAX_ATTEMPTS = 10

/**
 * Fixed-window login rate limit backed by Redis instead of in-memory state —
 * serverless functions don't share memory across invocations, so an
 * in-process counter (like express-rate-limit's default store) would reset
 * on every cold start and not actually limit anything.
 */
export async function checkLoginRateLimit(identifier) {
  const key = `login-attempts:${identifier}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS)
  }
  return count <= MAX_ATTEMPTS
}
