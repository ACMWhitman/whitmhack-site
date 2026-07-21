import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    renderOrganizersSection()
    for (const person of organizersSection.organizers) {
      expect(screen.getByText(person.name)).toBeInTheDocument()
      expect(screen.getByText(person.role)).toBeInTheDocument()
      expect(screen.getByRole('img', { name: `Photo of ${person.name}` })).toBeInTheDocument()
    }
  })

  it('has the section id spine-nav links against', () => {
    renderOrganizersSection()
    expect(document.getElementById('organizers')).toBeInTheDocument()
  })
})
