import { describe, it, expect } from 'vitest'
import { computeTiltRotation } from './tilt'

const CENTER = { x: 100, y: 100 }
const SIZE = { width: 200, height: 100 }

describe('computeTiltRotation', () => {
  it('returns no rotation when the cursor is exactly on the center', () => {
    const result = computeTiltRotation(CENTER, CENTER, SIZE, 10)
    expect(result).toEqual({ rotateX: 0, rotateY: 0 })
  })

  it('tilts positively on rotateY when the cursor is to the right of center', () => {
    const result = computeTiltRotation({ x: 200, y: 100 }, CENTER, SIZE, 10)
    expect(result.rotateY).toBeGreaterThan(0)
    expect(result.rotateX).toBe(0)
  })

  it('tilts negatively on rotateY when the cursor is to the left of center', () => {
    const result = computeTiltRotation({ x: 0, y: 100 }, CENTER, SIZE, 10)
    expect(result.rotateY).toBeLessThan(0)
  })

  it('tilts positively on rotateX when the cursor is above center', () => {
    const result = computeTiltRotation({ x: 100, y: 50 }, CENTER, SIZE, 10)
    expect(result.rotateX).toBeGreaterThan(0)
  })

  it('clamps rotation to maxTiltDeg even far outside the element bounds', () => {
    const result = computeTiltRotation({ x: 10000, y: -10000 }, CENTER, SIZE, 10)
    expect(result.rotateY).toBe(10)
    expect(result.rotateX).toBe(10)
  })

  it('returns zero rotation for a zero-size element instead of dividing by zero', () => {
    const result = computeTiltRotation({ x: 150, y: 50 }, CENTER, { width: 0, height: 0 }, 10)
    expect(result).toEqual({ rotateX: 0, rotateY: 0 })
  })
})
