import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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
  beforeEach(() => {
    // jsdom doesn't implement scrollIntoView; the component calls it when
    // keyboard navigation moves focus between cards.
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('renders every track from the data array, not hardcoded per-card', () => {
    renderTracksSection()

    for (const track of tracksSection.tracks) {
      const card = within(screen.getByTestId(`track-card-${track.id}`))
      expect(card.getByText(track.name)).toBeInTheDocument()
      expect(card.getByText(track.prize)).toBeInTheDocument()
    }
  })

  it('marks a card active on hover and reveals its falling-code accent', () => {
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
    renderTracksSection()
    const firstTrack = tracksSection.tracks[0]
    const card = screen.getByTestId(`track-card-${firstTrack.id}`)
    const name = screen.getByText(firstTrack.name)
    const description = screen.getByText(firstTrack.description)

    fireEvent.mouseEnter(card)
    expect(name).toHaveClass('is-glitching')
    expect(description).toHaveClass('is-glitching')

    fireEvent.mouseLeave(card)
    expect(name).not.toHaveClass('is-glitching')
    expect(description).not.toHaveClass('is-glitching')
  })

  it('moves focus to the next card on ArrowRight and scrolls it into view', () => {
    renderTracksSection()
    const [first, second] = tracksSection.tracks
    const firstCard = screen.getByTestId(`track-card-${first.id}`)
    const secondCard = screen.getByTestId(`track-card-${second.id}`)

    firstCard.focus()
    fireEvent.keyDown(firstCard, { key: 'ArrowRight' })

    expect(secondCard).toHaveFocus()
    expect(secondCard.scrollIntoView).toHaveBeenCalled()
  })

  it('moves focus to the previous card on ArrowLeft and stops at the first card', () => {
    renderTracksSection()
    const [first, second] = tracksSection.tracks
    const firstCard = screen.getByTestId(`track-card-${first.id}`)
    const secondCard = screen.getByTestId(`track-card-${second.id}`)

    secondCard.focus()
    fireEvent.keyDown(secondCard, { key: 'ArrowLeft' })
    expect(firstCard).toHaveFocus()

    fireEvent.keyDown(firstCard, { key: 'ArrowLeft' })
    expect(firstCard).toHaveFocus()
  })

  it('activates a card on keyboard focus, matching the mouse-hover effect', () => {
    renderTracksSection()
    const track = tracksSection.tracks[0]
    const card = screen.getByTestId(`track-card-${track.id}`)

    fireEvent.focus(card)
    expect(card).toHaveAttribute('data-active', 'true')

    fireEvent.blur(card)
    expect(card).toHaveAttribute('data-active', 'false')
  })
})
