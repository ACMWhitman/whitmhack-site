import { test, expect } from '@playwright/test'

test.describe('About and Tracks sections', () => {
  test('bento grid content becomes visible on scroll', async ({ page }) => {
    await page.goto('/')
    const about = page.getByTestId('about-section')
    await about.scrollIntoViewIfNeeded()
    await expect(about).toHaveAttribute('data-in-view', 'true')
  })

  test('tracks carousel supports arrow-key navigation', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { name: 'Challenges & Awards' }).scrollIntoViewIfNeeded()

    const firstCard = page.getByTestId('track-card-company-challenges')
    const secondCard = page.getByTestId('track-card-visionary-award')

    await firstCard.focus()
    await expect(firstCard).toHaveAttribute('data-active', 'true')

    await page.keyboard.press('ArrowRight')
    await expect(secondCard).toBeFocused()
    await expect(secondCard).toHaveAttribute('data-active', 'true')
    await expect(firstCard).toHaveAttribute('data-active', 'false')
  })
})
