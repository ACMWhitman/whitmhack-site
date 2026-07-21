import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

import { MatrixRain } from './MatrixRain'

describe('MatrixRain', () => {
  it('mounts the canvas without crashing when motion is allowed', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    // jsdom has no real 2D canvas implementation, so getContext('2d')
    // returns null here — this is exactly the environment the component
    // needs to degrade gracefully in.
    expect(() => render(<MatrixRain />)).not.toThrow()
    expect(screen.getByTestId('matrix-rain-canvas')).toBeInTheDocument()
  })

  it('renders a static fallback instead of a canvas under reduced motion', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    render(<MatrixRain />)
    expect(screen.getByTestId('matrix-rain-static')).toBeInTheDocument()
    expect(screen.queryByTestId('matrix-rain-canvas')).not.toBeInTheDocument()
  })

  it('marks the effect as decorative for assistive tech', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    render(<MatrixRain />)
    expect(screen.getByTestId('matrix-rain-canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('keeps the canvas at a clearly-visible-but-still-background opacity', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    render(<MatrixRain />)
    expect(screen.getByTestId('matrix-rain-canvas').className).toContain('opacity-[0.14]')
  })
})
