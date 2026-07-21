import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaqSection } from './FaqSection'
import { faqSection } from '../data/siteContent'
import { SoundProvider } from '../context/SoundContext'

function renderFaq() {
  return render(
    <SoundProvider>
      <FaqSection />
    </SoundProvider>
  )
}

describe('FaqSection', () => {
  beforeEach(() => {
    // Only fake the timer APIs our scramble effect uses. Faking every timer
    // (including setTimeout) breaks userEvent's internal scheduling and
    // hangs interactions indefinitely.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders every question from the data array', () => {
    renderFaq()
    for (const item of faqSection.questions) {
      expect(screen.getByText(item.question)).toBeInTheDocument()
    }
  })

  it('is collapsed by default with aria-expanded false and no answer in the DOM', () => {
    renderFaq()
    const first = faqSection.questions[0]
    const toggle = screen.getByTestId(`faq-toggle-${first.id}`)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId(`faq-answer-${first.id}`)).not.toBeInTheDocument()
  })

  it('reveals the correct final answer text once the scramble animation completes', async () => {
    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime })
    renderFaq()
    const first = faqSection.questions[0]
    const toggle = screen.getByTestId(`faq-toggle-${first.id}`)

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    // Fast-forward past every scramble frame. We only assert on the final,
    // settled text — not the intermediate scrambled frames, which are
    // randomized and not meaningful to assert on individually.
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId(`faq-answer-${first.id}`)).toHaveTextContent(first.answer)
  })

  it('collapses the answer again on a second click', async () => {
    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime })
    renderFaq()
    const first = faqSection.questions[0]
    const toggle = screen.getByTestId(`faq-toggle-${first.id}`)

    await user.click(toggle)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId(`faq-answer-${first.id}`)).not.toBeInTheDocument()
  })

  it('only keeps one answer open at a time', async () => {
    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime })
    renderFaq()
    const [first, second] = faqSection.questions

    await user.click(screen.getByTestId(`faq-toggle-${first.id}`))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    await user.click(screen.getByTestId(`faq-toggle-${second.id}`))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId(`faq-toggle-${first.id}`)).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId(`faq-toggle-${second.id}`)).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports keyboard activation via Enter and Space', async () => {
    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime })
    renderFaq()
    const first = faqSection.questions[0]
    const toggle = screen.getByTestId(`faq-toggle-${first.id}`)

    toggle.focus()
    await user.keyboard('{Enter}')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
