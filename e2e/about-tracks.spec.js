import { test, expect } from '@playwright/test'

test.describe('Awards section', () => {
  test('the awards section shows the placement prizes and participation certificate', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('heading', { name: 'Awards & Prizes' }).scrollIntoViewIfNeeded()

    await expect(page.getByTestId('track-card-first-place')).toContainText('$500')
    await expect(page.getByTestId('track-card-second-place')).toContainText('$300')
    await expect(page.getByTestId('track-card-third-place')).toContainText('$100')
    await expect(page.getByTestId('track-card-participation')).toContainText('Certificate')

    // One static copy of each card, in order — no marquee duplicates.
    const cards = page.getByTestId('tracks-list').locator('li')
    await expect(cards).toHaveCount(4)
    await expect(cards.nth(0)).toContainText('First Place')
    await expect(cards.nth(1)).toContainText('Second Place')
    await expect(cards.nth(2)).toContainText('Third Place')
    await expect(cards.nth(3)).toContainText('Participation')
  })
})
