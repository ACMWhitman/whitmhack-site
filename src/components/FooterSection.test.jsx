import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FooterSection } from './FooterSection'
import { footerSection } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

function renderFooter() {
  return render(
    <SoundProvider>
      <FooterSection />
    </SoundProvider>
  )
}

describe('FooterSection', () => {
  it('renders the register button', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: footerSection.registerLabel })).toBeInTheDocument()
  })

  it('renders every CS resource link from the data array', () => {
    renderFooter()
    for (const link of footerSection.resources) {
      expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument()
    }
  })

  it('renders every social link from the data array', () => {
    renderFooter()
    for (const link of footerSection.social) {
      expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument()
    }
  })

  it('labels the resource and social navs for assistive tech', () => {
    renderFooter()
    expect(screen.getByRole('navigation', { name: footerSection.resourcesHeading })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: footerSection.socialHeading })).toBeInTheDocument()
  })

  it('renders the global UI sound toggle', () => {
    renderFooter()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('glitches the register label on hover', () => {
    renderFooter()
    const button = screen.getByRole('link', { name: footerSection.registerLabel })
    const label = screen.getByText(footerSection.registerLabel)

    fireEvent.mouseEnter(button)
    expect(label).toHaveClass('is-glitching')

    fireEvent.mouseLeave(button)
    expect(label).not.toHaveClass('is-glitching')
  })

  it('gives the register button the glass core and flowing gradient text', () => {
    renderFooter()
    const button = screen.getByRole('link', { name: footerSection.registerLabel })
    const label = screen.getByText(footerSection.registerLabel)

    expect(button).toHaveClass('glass-core')
    expect(label).toHaveClass('text-flow-wheat')
    expect(label).toHaveClass('animate-text-flow')
  })

  it('wraps the register button in a spinning edge-light frame', () => {
    renderFooter()
    const button = screen.getByRole('link', { name: footerSection.registerLabel })
    expect(button.parentElement.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})
