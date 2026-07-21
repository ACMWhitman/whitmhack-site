import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

const mockPlayKeystroke = vi.fn()
vi.mock('../context/SoundContext', () => ({
  useSound: () => ({ playKeystroke: mockPlayKeystroke }),
}))

import { TypewriterHeadline } from './TypewriterHeadline'

const PHRASES = ['hi there', 'go team']

function renderHeadline(props) {
  return render(<TypewriterHeadline {...props} />)
}

describe('TypewriterHeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPlayKeystroke.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty and types characters forward over time', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderHeadline({ phrases: PHRASES })

    expect(screen.getByTestId('typewriter-display')).toHaveTextContent('|')

    act(() => {
      vi.advanceTimersByTime(45 * 3)
    })

    expect(screen.getByTestId('typewriter-display').textContent).toContain('hi ')
  })

  it('keeps changing over a long period rather than settling permanently', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderHeadline({ phrases: PHRASES })

    act(() => {
      vi.advanceTimersByTime(45 * 20)
    })
    const midText = screen.getByTestId('typewriter-display').textContent

    act(() => {
      vi.advanceTimersByTime(45 * 40)
    })
    const laterText = screen.getByTestId('typewriter-display').textContent

    expect(laterText).not.toBe(midText)
  })

  it('shows the first phrase statically, with no cursor animation, under reduced motion', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderHeadline({ phrases: PHRASES })

    expect(screen.getByTestId('typewriter-display')).toHaveTextContent(PHRASES[0])

    act(() => {
      vi.advanceTimersByTime(45 * 100)
    })
    expect(screen.getByTestId('typewriter-display')).toHaveTextContent(PHRASES[0])
  })

  it('exposes every phrase as static text for screen readers', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderHeadline({ phrases: PHRASES })
    for (const phrase of PHRASES) {
      expect(screen.getByText(new RegExp(phrase))).toBeInTheDocument()
    }
  })

  it('hides the animated line from assistive tech', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderHeadline({ phrases: PHRASES })
    expect(screen.getByTestId('typewriter-display')).toHaveAttribute('aria-hidden', 'true')
  })

  describe('keystroke sound', () => {
    it('plays automatically while the very first phrase types out on load', () => {
      mockUsePrefersReducedMotion.mockReturnValue(false)
      renderHeadline({ phrases: PHRASES })

      act(() => {
        vi.advanceTimersByTime(45 * 3)
      })

      expect(mockPlayKeystroke).toHaveBeenCalled()
    })

    it('goes silent once the first pass finishes, even as the animation keeps cycling', () => {
      mockUsePrefersReducedMotion.mockReturnValue(false)
      renderHeadline({ phrases: PHRASES })

      // 'hi there' is 8 characters; a few extra ticks push it past typing
      // into the pause/delete/next-phrase part of the cycle.
      act(() => {
        vi.advanceTimersByTime(45 * 9)
      })
      mockPlayKeystroke.mockClear()

      act(() => {
        vi.advanceTimersByTime(45 * 40)
      })

      expect(mockPlayKeystroke).not.toHaveBeenCalled()
    })

    it('plays again while the visitor hovers the text, well after the first pass', () => {
      mockUsePrefersReducedMotion.mockReturnValue(false)
      renderHeadline({ phrases: PHRASES })

      // 9 ticks lands mid-pause (charCount holds at 8, no more auto sound);
      // 25 more pushes past the pause into deleting, where charCount
      // actually changes again — this time only because of the hover.
      act(() => {
        vi.advanceTimersByTime(45 * 9)
      })
      mockPlayKeystroke.mockClear()

      fireEvent.mouseEnter(screen.getByTestId('typewriter-display'))
      act(() => {
        vi.advanceTimersByTime(45 * 25)
      })

      expect(mockPlayKeystroke).toHaveBeenCalled()
    })

    it('goes silent again once the cursor leaves, mid-cycle', () => {
      mockUsePrefersReducedMotion.mockReturnValue(false)
      renderHeadline({ phrases: PHRASES })

      act(() => {
        vi.advanceTimersByTime(45 * 9)
      })
      fireEvent.mouseEnter(screen.getByTestId('typewriter-display'))
      act(() => {
        vi.advanceTimersByTime(45 * 25)
      })
      expect(mockPlayKeystroke).toHaveBeenCalled()

      fireEvent.mouseLeave(screen.getByTestId('typewriter-display'))
      mockPlayKeystroke.mockClear()

      // Still mid-deletion here, so charCount keeps changing — proving
      // the silence is because of the mouse leaving, not a coincidental
      // pause in the animation.
      act(() => {
        vi.advanceTimersByTime(45 * 5)
      })

      expect(mockPlayKeystroke).not.toHaveBeenCalled()
    })
  })
})
