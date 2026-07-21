import { describe, it, expect } from 'vitest'
import { lerp } from './lerp'

describe('lerp', () => {
  it('returns the current value unchanged when factor is 0', () => {
    expect(lerp(0, 10, 0)).toBe(0)
  })

  it('returns the target value exactly when factor is 1', () => {
    expect(lerp(0, 10, 1)).toBe(10)
  })

  it('moves partway toward the target for a fractional factor', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('works when current is already past the target (moving backward)', () => {
    expect(lerp(10, 0, 0.25)).toBe(7.5)
  })

  it('converges toward the target when applied repeatedly', () => {
    let value = 0
    for (let i = 0; i < 50; i++) {
      value = lerp(value, 1, 0.1)
    }
    expect(value).toBeGreaterThan(0.99)
    expect(value).toBeLessThanOrEqual(1)
  })
})
