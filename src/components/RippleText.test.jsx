import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

import { RippleText } from './RippleText'

describe('RippleText', () => {
  it('mounts a canvas without crashing when motion is allowed', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    // jsdom has no real WebGL implementation, so getContext('webgl')
    // returns null here — the same environment MatrixRain/LiquidAvatar
    // already degrade gracefully in.
    expect(() => render(<RippleText text="Menu" />)).not.toThrow()
    expect(screen.getByTestId('ripple-text-canvas')).toBeInTheDocument()
  })

  it('is decorative (aria-hidden) since the real accessible name lives on the wrapping link/button', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    render(<RippleText text="About" />)
    expect(screen.getByTestId('ripple-text-canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders plain, immediately-visible text under reduced motion instead of a canvas', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    render(<RippleText text="Schedule" />)
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.queryByTestId('ripple-text-canvas')).not.toBeInTheDocument()
  })

  it('accepts a rippleSignal prop without crashing (re-trigger path for a persistent label)', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    const { rerender } = render(<RippleText text="Menu" rippleSignal={0} />)
    expect(() => rerender(<RippleText text="Menu" rippleSignal={1} />)).not.toThrow()
  })

  it('accepts a multi-color gradient and the chip icon flag without crashing', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    expect(() =>
      render(<RippleText text="Menu" colors={['#FFC627', '#00F5FF']} icon />)
    ).not.toThrow()
    expect(screen.getByTestId('ripple-text-canvas')).toBeInTheDocument()
  })

  it('renders a CSS gradient-clipped fallback under reduced motion when given multiple colors', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    render(<RippleText text="Menu" colors={['#FFC627', '#00F5FF']} />)
    const label = screen.getByText('Menu')
    expect(label).toHaveStyle({ backgroundClip: 'text' })
    expect(label).toHaveStyle({ color: 'rgba(0, 0, 0, 0)' })
  })

  it('renders a flat CSS color under reduced motion when given a single color', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    render(<RippleText text="About" colors={['#EFF2F9']} />)
    const label = screen.getByText('About')
    expect(label).toHaveStyle({ color: '#EFF2F9' })
  })
})
