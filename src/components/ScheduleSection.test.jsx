import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent, within } from '@testing-library/react'
import { ScheduleSection } from './ScheduleSection'
import { scheduleSection } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

const mockUsePrefersReducedMotion = vi.fn(() => false)
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

const allEvents = scheduleSection.days.flatMap((day) => day.events)

function renderSchedule() {
  return render(
    <SoundProvider>
      <ScheduleSection />
    </SoundProvider>
  )
}

describe('ScheduleSection', () => {
  let observers
  const originalIntersectionObserver = globalThis.IntersectionObserver

  beforeEach(() => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    observers = []
    class ControllableIntersectionObserver {
      constructor(callback) {
        this.callback = callback
        observers.push(this)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    globalThis.IntersectionObserver = ControllableIntersectionObserver
    return () => {
      globalThis.IntersectionObserver = originalIntersectionObserver
    }
  })

  it('renders every day and event from the data array', () => {
    renderSchedule()
    // Scoped per-event rather than a page-wide getByText lookup — real
    // schedules can reuse the same title for more than one block (e.g.
    // two separate "Build Sprint" sessions), so title text alone isn't
    // guaranteed unique across the whole page.
    for (const event of allEvents) {
      const eventElement = screen.getByTestId(`schedule-event-${event.id}`)
      expect(within(eventElement).getByText(event.title)).toBeInTheDocument()
    }
    for (const day of scheduleSection.days) {
      expect(screen.getByText(day.label)).toBeInTheDocument()
    }
  })

  it('locks a block until it scrolls into view, then unlocks it', () => {
    renderSchedule()
    const firstEvent = allEvents[0]
    const toggle = screen.getByTestId(`schedule-toggle-${firstEvent.id}`)
    expect(toggle).toBeDisabled()

    act(() => {
      observers[0].callback([{ isIntersecting: true }])
    })

    expect(toggle).toBeEnabled()
  })

  it('activates blocks in scroll order as each one comes into view', () => {
    renderSchedule()
    const [first, second] = allEvents
    const firstToggle = screen.getByTestId(`schedule-toggle-${first.id}`)
    const secondToggle = screen.getByTestId(`schedule-toggle-${second.id}`)

    act(() => {
      observers[0].callback([{ isIntersecting: true }])
    })
    expect(firstToggle).toBeEnabled()
    expect(secondToggle).toBeDisabled()

    act(() => {
      observers[1].callback([{ isIntersecting: true }])
    })
    expect(secondToggle).toBeEnabled()
  })

  it('toggles aria-expanded and reveals workshop details once unlocked', () => {
    renderSchedule()
    const event = allEvents[0]
    const toggle = screen.getByTestId(`schedule-toggle-${event.id}`)

    act(() => {
      observers[0].callback([{ isIntersecting: true }])
    })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(event.workshopDetails)).not.toBeInTheDocument()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(event.workshopDetails)).toBeInTheDocument()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('applies a scroll-linked parallax offset to the time label when motion is allowed', () => {
    renderSchedule()
    const firstEvent = allEvents[0]
    expect(screen.getByText(firstEvent.time)).toHaveAttribute('style')
  })

  it('skips the parallax offset under reduced motion', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderSchedule()
    const firstEvent = allEvents[0]
    expect(screen.getByText(firstEvent.time)).not.toHaveAttribute('style')
  })
})
