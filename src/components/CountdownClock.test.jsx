import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CountdownClock } from './CountdownClock'

describe('CountdownClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the initial remaining time', () => {
    render(<CountdownClock targetDate="2026-01-03T02:03:04Z" />)

    expect(screen.getByTestId('countdown-days')).toHaveTextContent('02')
    expect(screen.getByTestId('countdown-hours')).toHaveTextContent('02')
    expect(screen.getByTestId('countdown-minutes')).toHaveTextContent('03')
    expect(screen.getByTestId('countdown-seconds')).toHaveTextContent('04')
  })

  it('ticks down every second', () => {
    render(<CountdownClock targetDate="2026-01-01T00:00:10Z" />)
    expect(screen.getByTestId('countdown-seconds')).toHaveTextContent('10')

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByTestId('countdown-seconds')).toHaveTextContent('07')
  })

  it('shows a completion message once the target date has passed', () => {
    render(<CountdownClock targetDate="2025-01-01T00:00:00Z" />)
    expect(screen.getByText(/whitmhack is live/i)).toBeInTheDocument()
  })

  it('exposes the remaining time to assistive tech via aria-label', () => {
    render(<CountdownClock targetDate="2026-01-03T02:03:04Z" />)
    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('2 days')
    )
  })

  it('wraps every unit box in a spinning edge-light frame with a glass core', () => {
    render(<CountdownClock targetDate="2026-01-03T02:03:04Z" />)
    for (const key of ['days', 'hours', 'minutes', 'seconds']) {
      const digit = screen.getByTestId(`countdown-${key}`)
      expect(digit.closest('.glass-core-light')).not.toBeNull()
      expect(digit.closest('.group')).not.toBeNull()
      expect(digit).toHaveClass('text-flow-wheat')
      expect(digit).toHaveClass('animate-text-flow')
    }
  })
})
