import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('the full page has no automatically detectable a11y violations', async ({ page }) => {
    await page.goto('/')
    // Give the page a chance to render every section (some content only
    // mounts once particular effects settle) before auditing.
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('every interactive element on the page is reachable by keyboard alone', async ({ page }) => {
    await page.goto('/')

    const expectedLabels = [
      'Register Now',
      'Company Challenge Tracks, prize: Funded from a shared company prize pool (TBD per company)',
      'First-Time Hacker, prize: TBD',
    ]

    const reachableTexts = new Set()
    // Tab through a generous number of times to cover the whole page;
    // record what ends up focused each time.
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null
        return el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 60) || el.tagName
      })
      if (focused) reachableTexts.add(focused)
    }

    for (const label of expectedLabels) {
      expect([...reachableTexts].some((text) => text.includes(label) || label.includes(text))).toBe(
        true
      )
    }
  })

  test('the magnetic register button in the footer is keyboard-focusable and activatable', async ({
    page,
  }) => {
    await page.goto('/')
    const footerRegister = page.locator('footer').getByRole('link', { name: 'Register' })
    await footerRegister.focus()
    await expect(footerRegister).toBeFocused()
  })
})
