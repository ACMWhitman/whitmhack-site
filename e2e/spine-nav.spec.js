import { test, expect } from '@playwright/test'

test.describe('Spine navigation', () => {
  test('only the Menu toggle is visible on load — the panel is hidden by default', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByTestId('spine-nav-toggle')).toBeVisible()
    await expect(page.getByTestId('spine-nav-panel')).toHaveCount(0)
  })

  test('the Menu toggle stays fixed to the top-left as the page scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    const toggle = page.getByTestId('spine-nav-toggle')
    const before = await toggle.boundingBox()

    await page.mouse.wheel(0, 1500)
    const after = await toggle.boundingBox()

    expect(before.x).toBeLessThan(100)
    expect(before.y).toBeLessThan(100)
    expect(after.x).toBe(before.x)
    expect(after.y).toBe(before.y)
  })

  test('clicking the toggle reveals a single left-anchored, vertically centered block of horizontal titles', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    await page.getByTestId('spine-nav-toggle').click()
    const panel = page.getByTestId('spine-nav-panel')
    await expect(panel).toBeVisible()

    const aboutLink = page.getByTestId('spine-nav-about')
    const tracksLink = page.getByTestId('spine-nav-tracks')
    const aboutBox = await aboutLink.boundingBox()
    const tracksBox = await tracksLink.boundingBox()
    const viewport = page.viewportSize()

    // Horizontal orientation: each title is wider than it is tall.
    expect(aboutBox.width).toBeGreaterThan(aboutBox.height)

    // Anchored to the far left of the screen, not centered horizontally.
    expect(aboutBox.x).toBeLessThan(viewport.width / 3)

    // The whole block sits roughly centered vertically (titles stacked
    // around the viewport's vertical middle, not pinned to the top/bottom).
    const blockCenterY = (aboutBox.y + tracksBox.y + tracksBox.height) / 2
    expect(blockCenterY).toBeGreaterThan(viewport.height * 0.3)
    expect(blockCenterY).toBeLessThan(viewport.height * 0.7)
  })

  test('clicking a title closes the panel and scrolls to that section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    await page.getByTestId('spine-nav-toggle').click()
    await page.getByTestId('spine-nav-tracks').click()

    await expect(page.getByTestId('spine-nav-panel')).toHaveCount(0)
    await expect(page.locator('#tracks')).toBeInViewport()
  })

  test('the active section is tracked while closed and reflected the moment the panel reopens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    await page.locator('#tracks').scrollIntoViewIfNeeded()

    await page.getByTestId('spine-nav-toggle').click()
    await expect(page.getByTestId('spine-nav-tracks')).toHaveAttribute('aria-current', 'true', {
      timeout: 3000,
    })
  })

  test('toggling the menu twice closes it again, with no leftover panel in the DOM', async ({
    page,
  }) => {
    await page.goto('/')

    const toggle = page.getByTestId('spine-nav-toggle')
    await toggle.click()
    await expect(page.getByTestId('spine-nav-panel')).toBeVisible()

    await toggle.click()
    await expect(page.getByTestId('spine-nav-panel')).toHaveCount(0)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
