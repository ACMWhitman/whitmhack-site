import { describe, it, expect } from 'vitest'
import { getCountdown } from './countdown'

describe('getCountdown', () => {
  it('breaks a future date down into days/hours/minutes/seconds', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const target = new Date('2026-01-03T02:03:04Z')

    expect(getCountdown(target, now)).toEqual({
      days: 2,
      hours: 2,
      minutes: 3,
      seconds: 4,
      isComplete: false,
    })
  })

  it('returns all zeros and isComplete when the target has passed', () => {
    const now = new Date('2026-06-01T00:00:00Z')
    const target = new Date('2026-01-01T00:00:00Z')

    expect(getCountdown(target, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
    })
  })

  it('returns isComplete when now exactly equals the target', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    expect(getCountdown(now, now).isComplete).toBe(true)
  })

  it('accepts a date string as well as a Date object', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const result = getCountdown('2026-01-02T00:00:00Z', now)
    expect(result.days).toBe(1)
    expect(result.isComplete).toBe(false)
  })
})
