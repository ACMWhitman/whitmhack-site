import { describe, it, expect } from 'vitest'
import { computeMagneticOffset } from './magneticPull'

describe('computeMagneticOffset', () => {
  it('returns zero offset when the cursor is exactly on the center', () => {
    const offset = computeMagneticOffset({ x: 100, y: 100 }, { x: 100, y: 100 }, 80)
    expect(offset).toEqual({ x: 0, y: 0 })
  })

  it('returns zero offset once the cursor is outside the radius', () => {
    const offset = computeMagneticOffset({ x: 200, y: 100 }, { x: 100, y: 100 }, 80)
    expect(offset).toEqual({ x: 0, y: 0 })
  })

  it('pulls toward the cursor when inside the radius', () => {
    const offset = computeMagneticOffset({ x: 140, y: 100 }, { x: 100, y: 100 }, 80, 0.5)
    // Cursor is to the right of center, so the pull should be positive-x.
    expect(offset.x).toBeGreaterThan(0)
    expect(offset.y).toBe(0)
  })

  it('pulls harder, as a fraction of distance, the closer the cursor is to the center', () => {
    // Raw offset isn't monotonic with distance (it's distance times a
    // decreasing fraction, which peaks partway through the radius), so
    // compare the pull as a fraction of distance instead — that fraction
    // strictly decreases the further out you go.
    const near = computeMagneticOffset({ x: 110, y: 100 }, { x: 100, y: 100 }, 80, 0.5)
    const far = computeMagneticOffset({ x: 170, y: 100 }, { x: 100, y: 100 }, 80, 0.5)
    const nearRatio = near.x / 10
    const farRatio = far.x / 70
    expect(nearRatio).toBeGreaterThan(farRatio)
  })

  it('scales with the strength multiplier', () => {
    const weak = computeMagneticOffset({ x: 140, y: 100 }, { x: 100, y: 100 }, 80, 0.2)
    const strong = computeMagneticOffset({ x: 140, y: 100 }, { x: 100, y: 100 }, 80, 0.8)
    expect(strong.x).toBeGreaterThan(weak.x)
  })
})
