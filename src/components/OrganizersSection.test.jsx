import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

const mockUsePrefersReducedMotion = vi.fn()
vi.mock('../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => mockUsePrefersReducedMotion(),
}))

import { OrganizersSection } from './OrganizersSection'
import { organizersSection } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

function renderOrganizersSection() {
  return render(
    <SoundProvider>
      <OrganizersSection />
    </SoundProvider>
  )
}

describe('OrganizersSection', () => {
  it('renders a static team grid, not a scrolling marquee', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderOrganizersSection()
    const list = within(screen.getByTestId('organizers-list'))
    expect(list.getAllByRole('listitem')).toHaveLength(organizersSection.organizers.length)
    expect(screen.getAllByRole('list', { name: 'Team members' })).toHaveLength(1)
  })

  it('renders every organizer from the data array, not hardcoded per-card', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderOrganizersSection()
    for (const person of organizersSection.organizers) {
      expect(screen.getByText(person.name)).toBeInTheDocument()
      expect(screen.getByText(person.role)).toBeInTheDocument()
      expect(screen.getByRole('img', { name: `Photo of ${person.name}` })).toBeInTheDocument()
    }
  })

  it('renders the section with its expected id', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderOrganizersSection()
    expect(document.getElementById('organizers')).toBeInTheDocument()
  })
})
