import { test, expect } from '@playwright/test'

test.describe('Schedule section', () => {
  test('timeline events unlock as they scroll into view', async ({ page }) => {
    await page.goto('/')
    const firstToggle = page.getByTestId('schedule-toggle-d1-kickoff')
    const lastToggle = page.getByTestId('schedule-toggle-d2-awards')

    await expect(lastToggle).toBeDisabled()

    await firstToggle.scrollIntoViewIfNeeded()
    await expect(firstToggle).toBeEnabled()

    await firstToggle.click()
    await expect(firstToggle).toHaveAttribute('aria-expanded', 'true')
  })
})
