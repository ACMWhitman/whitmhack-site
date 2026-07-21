import { test, expect } from '@playwright/test'

test.describe('Micro-interactions', () => {
  test('the UI sound toggle flips state and persists across reload', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('switch', { name: /ui sound/i })
    await toggle.scrollIntoViewIfNeeded()

    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    await page.reload()
    await expect(page.getByRole('switch', { name: /ui sound/i })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  test('an about bento card tilts toward the cursor on hover', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('about-card-mission')
    await card.scrollIntoViewIfNeeded()
    const box = await card.boundingBox()

    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1)
    await expect(card).toHaveCSS('transform', /matrix3d|rotate/, { timeout: 2000 })
  })

  test('the hero headline renders as animated gradient text', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { name: 'WhitmHack 2026' })
    await expect(heading).toHaveCSS('color', 'rgba(0, 0, 0, 0)')
  })

  test('the register button shows a soft tactile shadow', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('link', { name: 'Register Now' })
    const boxShadow = await button.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(boxShadow).toContain('0px 8px 24px 0px')
  })

  test('the register button has a glass core with a spinning edge-light frame behind it', async ({
    page,
  }) => {
    await page.goto('/')
    const button = page.getByRole('link', { name: 'Register Now' })
    await expect(button).toHaveClass(/glass-core/)

    const backdropFilter = await button.evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(backdropFilter).not.toBe('none')
  })

  test('the register button label flows through a gradient', async ({ page }) => {
    await page.goto('/')
    const label = page.getByText('Register Now', { exact: true })
    await expect(label).toHaveCSS('color', 'rgba(0, 0, 0, 0)')
  })
})
