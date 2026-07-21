import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EdgeLightFrame } from './EdgeLightFrame'

describe('EdgeLightFrame', () => {
  it('renders its children', () => {
    render(
      <EdgeLightFrame>
        <button>Register Now</button>
      </EdgeLightFrame>
    )
    expect(screen.getByRole('button', { name: 'Register Now' })).toBeInTheDocument()
  })

  it('hides the decorative spinning gradient layer from assistive tech', () => {
    const { container } = render(
      <EdgeLightFrame>
        <span>content</span>
      </EdgeLightFrame>
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('merges a custom className onto the outer wrapper', () => {
    const { container } = render(
      <EdgeLightFrame className="rounded-full">
        <span>content</span>
      </EdgeLightFrame>
    )
    expect(container.firstChild).toHaveClass('rounded-full')
  })
})
