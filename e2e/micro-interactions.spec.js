import { test, expect } from '@playwright/test'

test.describe('Micro-interactions', () => {
  test('the hero headline renders as flat Whitman yellow', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { name: 'WhitHack 2026' })
    await expect(heading).toHaveCSS('color', 'rgb(255, 198, 39)')
  })

  test('the register button shows a soft tactile shadow', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('link', { name: 'Register Now' })
    const boxShadow = await button.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(boxShadow).toContain('0px 8px 24px 0px')
  })

  test('the register button is a solid Whitman yellow button', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('link', { name: 'Register Now' })
    await expect(button).toHaveClass(/bg-electric-wheat/)

    const backgroundColor = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(backgroundColor).toBe('rgb(255, 198, 39)')
  })

  test('the register button label renders in navy on the yellow', async ({ page }) => {
    await page.goto('/')
    const label = page.getByText('Register Now', { exact: true })
    await expect(label).toHaveCSS('color', 'rgb(1, 14, 48)')
  })
})
