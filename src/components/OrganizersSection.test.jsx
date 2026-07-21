import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
  it('renders every organizer from the data array, not hardcoded per-card', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderOrganizersSection()
    for (const person of organizersSection.organizers) {
      expect(screen.getByText(person.name)).toBeInTheDocument()
      expect(screen.getByText(person.role)).toBeInTheDocument()
      expect(screen.getByRole('img', { name: `Photo of ${person.name}` })).toBeInTheDocument()
    }
  })

  it('has the section id spine-nav links against', () => {
    mockUsePrefersReducedMotion.mockReturnValue(true)
    renderOrganizersSection()
    expect(document.getElementById('organizers')).toBeInTheDocument()
  })

  it('renders a second, aria-hidden copy of every organizer so the marquee loops seamlessly', () => {
    mockUsePrefersReducedMotion.mockReturnValue(false)
    renderOrganizersSection()
    for (const person of organizersSection.organizers) {
      expect(screen.getAllByText(person.name)).toHaveLength(2)
    }
    // Accessibility-tree-aware queries should still only ever see one team row.
    expect(screen.getAllByRole('list', { name: 'Team members' })).toHaveLength(1)
  })
})
