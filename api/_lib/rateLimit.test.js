import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const redisMock = {
  incr: vi.fn(),
  expire: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(function Redis() {
    return redisMock
  }),
}))

describe('checkLoginRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'https://example.upstash.io'
    process.env.KV_REST_API_TOKEN = 'test-token'
  })

  afterEach(() => {
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
  })

  it('allows the first attempt and starts the expiry window', async () => {
    redisMock.incr.mockResolvedValue(1)
    const { checkLoginRateLimit } = await import('./rateLimit.js')

    const allowed = await checkLoginRateLimit('1.2.3.4')

    expect(allowed).toBe(true)
    expect(redisMock.expire).toHaveBeenCalledWith('login-attempts:1.2.3.4', 15 * 60)
  })

  it('allows attempts under the max without resetting the expiry', async () => {
    redisMock.incr.mockResolvedValue(5)
    const { checkLoginRateLimit } = await import('./rateLimit.js')

    const allowed = await checkLoginRateLimit('1.2.3.4')

    expect(allowed).toBe(true)
    expect(redisMock.expire).not.toHaveBeenCalled()
  })

  it('blocks once the attempt count exceeds the max', async () => {
    redisMock.incr.mockResolvedValue(11)
    const { checkLoginRateLimit } = await import('./rateLimit.js')

    const allowed = await checkLoginRateLimit('1.2.3.4')

    expect(allowed).toBe(false)
  })

  it('keys the counter per identifier so one IP cannot lock out another', async () => {
    redisMock.incr.mockResolvedValue(1)
    const { checkLoginRateLimit } = await import('./rateLimit.js')

    await checkLoginRateLimit('5.6.7.8')

    expect(redisMock.incr).toHaveBeenCalledWith('login-attempts:5.6.7.8')
  })
})
