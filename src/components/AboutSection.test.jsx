import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { AboutSection } from './AboutSection'
import { about } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

function renderAboutSection() {
  return render(
    <SoundProvider>
      <AboutSection />
    </SoundProvider>
  )
}

describe('AboutSection', () => {
  it('renders every bento block from the data array, not hardcoded per-card', () => {
    renderAboutSection()

    for (const block of about.bento) {
      expect(screen.getByText(block.heading)).toBeInTheDocument()
      expect(screen.getByText(block.body)).toBeInTheDocument()
    }
  })

  it('starts out of view before the IntersectionObserver reports intersection', () => {
    renderAboutSection()
    expect(screen.getByTestId('about-section')).toHaveAttribute('data-in-view', 'false')
  })

  describe('scroll-triggered reveal', () => {
    let observedCallback
    const originalIntersectionObserver = globalThis.IntersectionObserver

    beforeEach(() => {
      class ControllableIntersectionObserver {
        constructor(callback) {
          observedCallback = callback
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

    it('flips into view once the observer reports the section is intersecting', () => {
      renderAboutSection()
      expect(screen.getByTestId('about-section')).toHaveAttribute('data-in-view', 'false')

      act(() => {
        observedCallback([{ isIntersecting: true }])
      })

      expect(screen.getByTestId('about-section')).toHaveAttribute('data-in-view', 'true')
    })
  })

  it('tilts a bento card toward the cursor on pointer move without throwing, and resets on pointer leave', () => {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 260,
      height: 160,
      right: 260,
      bottom: 160,
    }))
    renderAboutSection()
    const card = screen.getByTestId(`about-card-${about.bento[0].id}`)

    expect(() => {
      fireEvent.pointerMove(card, { clientX: 240, clientY: 20 })
      fireEvent.pointerLeave(card)
    }).not.toThrow()
  })
})
