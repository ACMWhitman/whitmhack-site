import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlitchText } from './GlitchText'

describe('GlitchText', () => {
  it('renders the text and a matching data-text attribute for the CSS pseudo-elements to read', () => {
    render(<GlitchText text="Register Now" />)
    const el = screen.getByText('Register Now')
    expect(el).toHaveAttribute('data-text', 'Register Now')
  })

  it('is not glitching by default', () => {
    render(<GlitchText text="AI / ML" />)
    expect(screen.getByText('AI / ML')).not.toHaveClass('is-glitching')
  })

  it('applies the glitching class when active', () => {
    render(<GlitchText text="AI / ML" active />)
    expect(screen.getByText('AI / ML')).toHaveClass('is-glitching')
  })

  it('renders as the given tag', () => {
    render(<GlitchText text="EdTech" as="h3" />)
    expect(screen.getByText('EdTech').tagName).toBe('H3')
  })
})
