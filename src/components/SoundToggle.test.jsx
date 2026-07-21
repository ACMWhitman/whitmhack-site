import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SoundProvider } from '../context/SoundContext'
import { SoundToggle } from './SoundToggle'

function renderToggle() {
  return render(
    <SoundProvider>
      <SoundToggle />
    </SoundProvider>
  )
}

describe('SoundToggle', () => {
  beforeEach(() => {
    window.localStorage.removeItem('whitmhack-sound-enabled')
  })

  it('defaults to off', () => {
    renderToggle()
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(toggle).toHaveTextContent('Off')
  })

  it('flips to on when clicked, and back to off on a second click', () => {
    renderToggle()
    const toggle = screen.getByRole('switch')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(toggle).toHaveTextContent('On')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('persists the preference to localStorage', () => {
    renderToggle()
    fireEvent.click(screen.getByRole('switch'))
    expect(window.localStorage.getItem('whitmhack-sound-enabled')).toBe('true')
  })
})
