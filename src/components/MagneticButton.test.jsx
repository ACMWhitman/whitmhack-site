import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MagneticButton } from './MagneticButton'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

describe('MagneticButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders as a link with the given href and label', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    render(<MagneticButton href="#register">Register</MagneticButton>)
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '#register')
  })

  it('does not throw when the pointer moves over or leaves the button', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      width: 40,
      height: 40,
      right: 140,
      bottom: 140,
    }))

    render(<MagneticButton href="#register">Register</MagneticButton>)
    const link = screen.getByRole('link', { name: 'Register' })

    expect(() => {
      fireEvent.pointerMove(link, { clientX: 110, clientY: 110 })
      fireEvent.pointerLeave(link)
    }).not.toThrow()
  })

  it('skips pointer tracking entirely when the user prefers reduced motion', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    const getBoundingClientRect = vi.fn()
    Element.prototype.getBoundingClientRect = getBoundingClientRect

    render(<MagneticButton href="#register">Register</MagneticButton>)
    fireEvent.pointerMove(screen.getByRole('link', { name: 'Register' }), {
      clientX: 110,
      clientY: 110,
    })

    expect(getBoundingClientRect).not.toHaveBeenCalled()
  })
})
