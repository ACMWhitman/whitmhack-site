import { Redis } from '@upstash/redis'

// Vercel's Upstash Redis integration has used a couple of different env var
// naming conventions over time (KV_REST_API_* for backward compatibility
// with the old @vercel/kv package, UPSTASH_REDIS_REST_* for the native
// Upstash naming) — check both so this works regardless of which one shows
// up after linking the integration in the Vercel dashboard.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  throw new Error(
    'Missing Redis credentials. Link an Upstash Redis store to this project ' +
      'in the Vercel dashboard (Storage tab) — it sets these env vars automatically.'
  )
}

export const redis = new Redis({ url, token })
