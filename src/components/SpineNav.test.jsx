import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import { SpineNav } from './SpineNav'
import { SoundProvider } from '../context/SoundContext'
import { spineNav } from '../data/siteContent'

function renderSectionsAndNav() {
  // SpineNav looks up each target section by id via document.getElementById,
  // so the test needs real elements with those ids present in the DOM.
  for (const item of spineNav) {
    if (!document.getElementById(item.id)) {
      const section = document.createElement('div')
      section.id = item.id
      document.body.appendChild(section)
    }
  }
  return render(
    <SoundProvider>
      <SpineNav />
    </SoundProvider>
  )
}

describe('SpineNav', () => {
  let observers
  const originalIntersectionObserver = globalThis.IntersectionObserver

  beforeEach(() => {
    document.body.innerHTML = ''
    // jsdom doesn't implement scrollIntoView; the panel calls it explicitly
    // when a nav link is clicked (see the comment in SpineNav.jsx for why
    // it can't just rely on the anchor's own default behavior).
    Element.prototype.scrollIntoView = vi.fn()
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

  it('shows only the menu toggle by default — the panel is not in the document', () => {
    renderSectionsAndNav()
    expect(screen.getByTestId('spine-nav-toggle')).toBeInTheDocument()
    expect(screen.queryByTestId('spine-nav-panel')).not.toBeInTheDocument()
    expect(screen.getByTestId('spine-nav-toggle')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the panel with every nav item as a real, labeled link', () => {
    renderSectionsAndNav()
    fireEvent.click(screen.getByTestId('spine-nav-toggle'))

    expect(screen.getByTestId('spine-nav-panel')).toBeInTheDocument()
    expect(screen.getByTestId('spine-nav-toggle')).toHaveAttribute('aria-expanded', 'true')
    for (const item of spineNav) {
      const link = screen.getByTestId(`spine-nav-${item.id}`)
      expect(link).toHaveAttribute('href', `#${item.id}`)
      expect(link).toHaveAttribute('aria-label', item.label)
    }
  })

  it('closes the panel again on a second toggle click', async () => {
    renderSectionsAndNav()
    const toggle = screen.getByTestId('spine-nav-toggle')

    fireEvent.click(toggle)
    expect(screen.getByTestId('spine-nav-panel')).toBeInTheDocument()

    fireEvent.click(toggle)
    // The panel now exits via a Framer Motion slide/fade instead of
    // vanishing on the same tick, so it stays mounted for the duration of
    // that exit animation before AnimatePresence actually removes it.
    await waitFor(
      () => {
        expect(screen.queryByTestId('spine-nav-panel')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the panel and scrolls to the target section when a nav link is clicked', async () => {
    renderSectionsAndNav()
    fireEvent.click(screen.getByTestId('spine-nav-toggle'))
    const targetElement = document.getElementById(spineNav[1].id)

    fireEvent.click(screen.getByTestId(`spine-nav-${spineNav[1].id}`))

    // Scrolling happens immediately on click, before the exit animation
    // even starts — the destination is already settling into view while
    // the panel dissolves on top of it.
    expect(targetElement.scrollIntoView).toHaveBeenCalled()
    await waitFor(
      () => {
        expect(screen.queryByTestId('spine-nav-panel')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('marks the first section active by default, before any scroll', () => {
    renderSectionsAndNav()
    fireEvent.click(screen.getByTestId('spine-nav-toggle'))
    expect(screen.getByTestId(`spine-nav-${spineNav[0].id}`)).toHaveAttribute(
      'aria-current',
      'true'
    )
    expect(screen.getByTestId(`spine-nav-${spineNav[1].id}`)).not.toHaveAttribute('aria-current')
  })

  it('keeps tracking the active section via IntersectionObserver while the panel is closed', () => {
    renderSectionsAndNav()
    const tracksElement = document.getElementById('tracks')

    act(() => {
      for (const observer of observers) {
        observer.callback([{ isIntersecting: true, target: tracksElement }])
      }
    })

    // Panel is still closed — nothing to assert on the (unmounted) links —
    // but opening it now should immediately reflect the tracked section.
    fireEvent.click(screen.getByTestId('spine-nav-toggle'))
    expect(screen.getByTestId('spine-nav-tracks')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByTestId(`spine-nav-${spineNav[0].id}`)).not.toHaveAttribute('aria-current')
  })

  it('moves aria-current off the previous section once the next one becomes active', () => {
    renderSectionsAndNav()
    fireEvent.click(screen.getByTestId('spine-nav-toggle'))
    const aboutElement = document.getElementById('about')
    const tracksElement = document.getElementById('tracks')

    act(() => {
      for (const observer of observers) {
        observer.callback([{ isIntersecting: true, target: aboutElement }])
      }
    })
    expect(screen.getByTestId('spine-nav-about')).toHaveAttribute('aria-current', 'true')

    act(() => {
      for (const observer of observers) {
        observer.callback([
          { isIntersecting: false, target: aboutElement },
          { isIntersecting: true, target: tracksElement },
        ])
      }
    })
    expect(screen.getByTestId('spine-nav-about')).not.toHaveAttribute('aria-current')
    expect(screen.getByTestId('spine-nav-tracks')).toHaveAttribute('aria-current', 'true')
  })
})
