import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import { TracksSection } from './TracksSection'
import { tracksSection } from '../data/siteContent'

function renderTracksSection() {
  return render(<TracksSection />)
}

describe('TracksSection', () => {
  it('renders a static, non-scrolling awards section', () => {
    renderTracksSection()
    expect(screen.getByRole('heading', { name: tracksSection.title })).toBeInTheDocument()
  })

  it('renders every award from the data array, not hardcoded per-card', () => {
    renderTracksSection()
    const list = within(screen.getByTestId('tracks-list'))

    expect(list.getAllByRole('listitem')).toHaveLength(tracksSection.tracks.length)

    for (const track of tracksSection.tracks) {
      const card = within(screen.getByTestId(`track-card-${track.id}`))
      expect(card.getByText(track.name)).toBeInTheDocument()
      expect(card.getByText(track.description)).toBeInTheDocument()
      expect(card.getByText(track.prize)).toBeInTheDocument()
    }
  })

  it('lists the placement prizes once each, plus a participation certificate', () => {
    renderTracksSection()
    expect(screen.getAllByText('$500')).toHaveLength(1)
    expect(screen.getAllByText('$300')).toHaveLength(1)
    expect(screen.getAllByText('$100')).toHaveLength(1)
    expect(screen.getAllByText('Certificate')).toHaveLength(1)
    expect(screen.queryByText(/company challenge/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/visionary/i)).not.toBeInTheDocument()
  })

  it('gives the First Place box the large span', () => {
    renderTracksSection()
    const cards = screen.getByTestId('tracks-list').querySelectorAll('li')
    const first = screen.getByTestId('track-card-first-place')
    expect(cards[0]).toBe(first)
    expect(first.className).toContain('sm:row-span-2')
  })
})
