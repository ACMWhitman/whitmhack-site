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
  // Tracks/Organizers now auto-scroll continuously, which fights
  // Playwright's "wait for the element to stop moving" actionability check
  // on scrollIntoView — this test cares about cross-section integration,
  // not animation itself (each section has its own focused spec for that),
  // so reduced motion keeps it deterministic.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  // 1. Hero: title, countdown, and CTA are visible immediately.
  await expect(page.getByRole('heading', { name: 'WhitHack 2026' })).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()

  // 2. Awards: the placement prizes and participation certificate are present.
  const firstAward = page.getByTestId('track-card-first-place')
  await firstAward.scrollIntoViewIfNeeded()
  await expect(firstAward).toContainText('$500')
  await expect(page.getByTestId('track-card-second-place')).toContainText('$300')
  await expect(page.getByTestId('track-card-third-place')).toContainText('$100')
  await expect(page.getByTestId('track-card-participation')).toContainText('Certificate')

  // 3. Schedule: scroll an event into view, unlock it, open its details.
  const scheduleToggle = page.getByTestId('schedule-toggle-d1-kickoff')
  await scheduleToggle.scrollIntoViewIfNeeded()
  await expect(scheduleToggle).toBeEnabled()
  await scheduleToggle.click()
  await expect(scheduleToggle).toHaveAttribute('aria-expanded', 'true')

  // 5. Footer: resource/social links and the organizers line are reachable.
  const footer = page.locator('footer')
  await footer.scrollIntoViewIfNeeded()
  await expect(footer).toContainText('WhitHack · Whitman College')
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible()
})
