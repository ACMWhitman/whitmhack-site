import { test, expect } from '@playwright/test'

test.describe('Hero section', () => {
  test('shows the title, countdown, and register CTA on load', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'WhitmHack 2026' })).toBeVisible()
    await expect(page.getByRole('timer')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Register Now' })).toBeVisible()
  })

  test('shows the matrix rain canvas when motion is allowed', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('matrix-rain-canvas')).toBeVisible()
  })

  test('respects prefers-reduced-motion by skipping the animated canvas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    await expect(page.getByTestId('matrix-rain-static')).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
  })
})
