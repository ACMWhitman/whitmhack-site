import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

import { LiquidAvatar } from './LiquidAvatar'
import { SoundProvider } from '../context/SoundContext'

function renderAvatar(props) {
  return render(
    <SoundProvider>
      <LiquidAvatar {...props} />
    </SoundProvider>
  )
}

describe('LiquidAvatar', () => {
  it('mounts the canvas without crashing when motion is allowed', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    // jsdom has no real WebGL implementation, so getContext('webgl')
    // returns null here — exactly the environment this needs to degrade
    // gracefully in, the same way MatrixRain does for its 2D context.
    expect(() => renderAvatar({ name: 'Jordan Avery' })).not.toThrow()
    expect(screen.getByTestId('liquid-avatar-canvas')).toBeInTheDocument()
  })

  it('renders a static gradient-and-initials fallback under reduced motion', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderAvatar({ name: 'Priya Shah' })
    expect(screen.getByTestId('liquid-avatar-static')).toBeInTheDocument()
    expect(screen.getByText('PS')).toBeInTheDocument()
    expect(screen.queryByTestId('liquid-avatar-canvas')).not.toBeInTheDocument()
  })

  it('exposes an accessible name for the person, since this is real content not decoration', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderAvatar({ name: 'Marcus Lee' })
    expect(screen.getByRole('img', { name: 'Photo of Marcus Lee' })).toBeInTheDocument()
  })

  it('exposes the same accessible name in the reduced-motion fallback', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderAvatar({ name: 'Marcus Lee' })
    expect(screen.getByRole('img', { name: 'Photo of Marcus Lee' })).toBeInTheDocument()
  })
})
