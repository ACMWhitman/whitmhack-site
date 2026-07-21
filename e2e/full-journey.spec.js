import { test, expect } from '@playwright/test'

/**
 * One end-to-end test that walks the whole visitor journey in order:
 * land on the hero, scroll through every section, interact with the
 * carousel and schedule, open an FAQ question, and reach the register
 * CTA. Section-level behavior already has its own focused specs — this
 * test exists to catch regressions in how the sections work *together*
 * (e.g. one section's animation stealing focus/scroll from another).
 */
test('a visitor can land, explore every section, and reach registration', async ({ page }) => {
  await page.goto('/')

  // 1. Hero: title, countdown, and CTA are visible immediately.
  await expect(page.getByRole('heading', { name: 'WhitmHack 2026' })).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()

  // 2. About: bento grid reveals as it scrolls into view.
  const about = page.getByTestId('about-section')
  await about.scrollIntoViewIfNeeded()
  await expect(about).toHaveAttribute('data-in-view', 'true')
  await expect(page.getByRole('heading', { name: /built to bridge campus and industry/i })).toBeVisible()

  // 3. Tracks: keyboard through a couple of cards.
  const firstTrack = page.getByTestId('track-card-company-challenges')
  await firstTrack.scrollIntoViewIfNeeded()
  await firstTrack.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByTestId('track-card-visionary-award')).toBeFocused()

  // 4. Schedule: scroll an event into view, unlock it, open its details.
  const scheduleToggle = page.getByTestId('schedule-toggle-d1-kickoff')
  await scheduleToggle.scrollIntoViewIfNeeded()
  await expect(scheduleToggle).toBeEnabled()
  await scheduleToggle.click()
  await expect(scheduleToggle).toHaveAttribute('aria-expanded', 'true')

  // 5. FAQ: open a question and see the real answer settle in.
  const faqToggle = page.getByTestId('faq-toggle-who-can-attend')
  await faqToggle.scrollIntoViewIfNeeded()
  await faqToggle.click()
  await expect(page.getByTestId('faq-answer-who-can-attend')).toContainText(
    'Students from colleges and universities across Washington',
    { timeout: 2000 }
  )

  // 6. Footer: the register CTA is reachable and points at the register anchor.
  const footerRegister = page.locator('footer').getByRole('link', { name: 'Register' })
  await footerRegister.scrollIntoViewIfNeeded()
  await expect(footerRegister).toBeVisible()
  await expect(footerRegister).toHaveAttribute('href', '#register')
})
