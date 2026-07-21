import { test, expect } from '@playwright/test'

test.describe('About and Tracks sections', () => {
  test('bento grid content becomes visible on scroll', async ({ page }) => {
    await page.goto('/')
    const about = page.getByTestId('about-section')
    await about.scrollIntoViewIfNeeded()
    await expect(about).toHaveAttribute('data-in-view', 'true')
  })

  test('tracks marquee activates a card on focus and only the real copy is tab-reachable', async ({ page }) => {
    // The marquee drifts continuously, which fights Playwright's "wait for
    // the element to stop moving" actionability check on scrollIntoView —
    // reduced motion renders the static fallback list instead, same trick
    // hero.spec.js already uses for its own scroll-stability needs.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('heading', { name: 'Challenges & Awards' }).scrollIntoViewIfNeeded()

    const firstCard = page.getByTestId('track-card-company-challenges')
    const secondCard = page.getByTestId('track-card-visionary-award')

    await firstCard.focus()
    await expect(firstCard).toHaveAttribute('data-active', 'true')

    await page.keyboard.press('Tab')
    await expect(secondCard).toBeFocused()
    await expect(secondCard).toHaveAttribute('data-active', 'true')
    await expect(firstCard).toHaveAttribute('data-active', 'false')
  })
})
