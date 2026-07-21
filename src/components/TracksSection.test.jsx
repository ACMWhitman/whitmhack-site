import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

import { TracksSection } from './TracksSection'
import { tracksSection } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

function renderTracksSection() {
  return render(
    <SoundProvider>
      <TracksSection />
    </SoundProvider>
  )
}

describe('TracksSection', () => {
  it('renders every track from the data array, not hardcoded per-card', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderTracksSection()
    const list = within(screen.getByTestId('tracks-list'))

    for (const track of tracksSection.tracks) {
      const card = within(screen.getByTestId(`track-card-${track.id}`))
      expect(card.getByText(track.name)).toBeInTheDocument()
      expect(card.getByText(track.prize)).toBeInTheDocument()
    }
    expect(list.getAllByRole('listitem')).toHaveLength(tracksSection.tracks.length)
  })

  it('renders a second, aria-hidden copy of every card so the marquee loops seamlessly', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderTracksSection()
    // getByText isn't accessibility-tree-aware, so it sees both the real
    // and the duplicate copy — exactly two matches confirms the loop
    // content is there without leaking a third, stray render.
    for (const track of tracksSection.tracks) {
      expect(screen.getAllByText(track.name)).toHaveLength(2)
    }
  })

  it('keeps the duplicate copy out of the accessibility tree and tab order', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderTracksSection()
    // role="list" queries are accessibility-tree-aware, so only the real,
    // non-hidden list should be reachable this way.
    expect(screen.getAllByRole('list', { name: 'Track categories' })).toHaveLength(1)

    const firstTrack = tracksSection.tracks[0]
    const [realCard, duplicateCard] = screen.getAllByText(firstTrack.name).map((el) => el.closest('li'))
    expect(realCard).toHaveAttribute('tabIndex', '0')
    expect(duplicateCard).toHaveAttribute('tabIndex', '-1')
  })

  it('marks a card active on hover and reveals its falling-code accent', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderTracksSection()
    const firstTrack = tracksSection.tracks[0]
    const card = screen.getByTestId(`track-card-${firstTrack.id}`)

    expect(card).toHaveAttribute('data-active', 'false')

    fireEvent.mouseEnter(card)
    expect(card).toHaveAttribute('data-active', 'true')

    fireEvent.mouseLeave(card)
    expect(card).toHaveAttribute('data-active', 'false')
  })

  it('glitches the card name and description while active', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderTracksSection()
    const firstTrack = tracksSection.tracks[0]
    const card = screen.getByTestId(`track-card-${firstTrack.id}`)
    const name = within(card).getByText(firstTrack.name)
    const description = within(card).getByText(firstTrack.description)

    fireEvent.mouseEnter(card)
    expect(name).toHaveClass('is-glitching')
    expect(description).toHaveClass('is-glitching')

    fireEvent.mouseLeave(card)
    expect(name).not.toHaveClass('is-glitching')
    expect(description).not.toHaveClass('is-glitching')
  })

  it('activates a card on keyboard focus, matching the mouse-hover effect', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderTracksSection()
    const track = tracksSection.tracks[0]
    const card = screen.getByTestId(`track-card-${track.id}`)

    fireEvent.focus(card)
    expect(card).toHaveAttribute('data-active', 'true')

    fireEvent.blur(card)
    expect(card).toHaveAttribute('data-active', 'false')
  })

  it('falls back to a single, non-looping list under prefers-reduced-motion', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderTracksSection()

    for (const track of tracksSection.tracks) {
      expect(screen.getAllByText(track.name)).toHaveLength(1)
    }
  })
})
