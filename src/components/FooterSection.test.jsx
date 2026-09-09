import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FooterSection } from './FooterSection'
import { footerSection } from '../data/siteContent'

describe('FooterSection', () => {
  it('renders every CS resource link from the data array', () => {
    render(<FooterSection />)
    for (const link of footerSection.resources) {
      expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument()
    }
  })

  it('renders every social link from the data array', () => {
    render(<FooterSection />)
    for (const link of footerSection.social) {
      expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument()
    }
  })

  it('labels the resource and social navs for assistive tech', () => {
    render(<FooterSection />)
    expect(screen.getByRole('navigation', { name: footerSection.resourcesHeading })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: footerSection.socialHeading })).toBeInTheDocument()
  })

  it('shows the organizers line and the copyright notice', () => {
    render(<FooterSection />)
    expect(screen.getByText(footerSection.organizers)).toBeInTheDocument()
    expect(screen.getByText(/WhitHack · Whitman College/)).toBeInTheDocument()
  })
})
