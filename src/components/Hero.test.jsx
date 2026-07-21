import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('./MatrixRain', () => ({
  MatrixRain: () => <div data-testid="matrix-rain-stub" />,
}))

import { Hero } from './Hero'
import { hero } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

function renderHero() {
  return render(
    <SoundProvider>
      <Hero />
    </SoundProvider>
  )
}

describe('Hero', () => {
  it('renders the title, subtitle, and register CTA', () => {
    renderHero()

    expect(screen.getByRole('heading', { name: hero.title })).toBeInTheDocument()
    expect(screen.getByText(hero.subtitle)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: hero.ctaLabel })).toHaveAttribute(
      'href',
      hero.ctaHref
    )
  })

  it('renders the matrix rain background', () => {
    renderHero()
    expect(screen.getByTestId('matrix-rain-stub')).toBeInTheDocument()
  })

  it('renders a live countdown timer', () => {
    renderHero()
    expect(screen.getByRole('timer')).toBeInTheDocument()
  })

  it('renders the typewriter tagline with a static screen-reader fallback', () => {
    renderHero()
    expect(screen.getByTestId('typewriter-display')).toBeInTheDocument()
    // The sr-only paragraph carries every tagline as plain, non-animated text.
    for (const tagline of hero.taglines) {
      expect(screen.getByText(new RegExp(tagline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
    }
  })

  it('glitches the CTA label on hover and settles back on mouse leave', () => {
    renderHero()
    const cta = screen.getByRole('link', { name: hero.ctaLabel })
    const label = screen.getByText(hero.ctaLabel)

    expect(label).not.toHaveClass('is-glitching')

    fireEvent.mouseEnter(cta)
    expect(label).toHaveClass('is-glitching')

    fireEvent.mouseLeave(cta)
    expect(label).not.toHaveClass('is-glitching')
  })

  it('gives the register CTA the glass core and flowing gradient text', () => {
    renderHero()
    const cta = screen.getByRole('link', { name: hero.ctaLabel })
    const label = screen.getByText(hero.ctaLabel)

    expect(cta).toHaveClass('glass-core')
    expect(label).toHaveClass('text-flow-wheat')
    expect(label).toHaveClass('animate-text-flow')
  })

  it('wraps the register CTA in a spinning edge-light frame', () => {
    renderHero()
    const cta = screen.getByRole('link', { name: hero.ctaLabel })
    // EdgeLightFrame's decorative gradient layer is a sibling of the real
    // link, inside the same wrapper.
    expect(cta.parentElement.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})
