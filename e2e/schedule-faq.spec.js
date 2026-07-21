import { test, expect } from '@playwright/test'

test.describe('Schedule and FAQ sections', () => {
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

  test('FAQ accordion opens one question at a time and settles on the real answer', async ({ page }) => {
    await page.goto('/')
    const firstQuestion = page.getByTestId('faq-toggle-who-can-attend')
    await firstQuestion.scrollIntoViewIfNeeded()

    await firstQuestion.click()
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('faq-answer-who-can-attend')).toContainText(
      'Students from colleges and universities across Washington',
      { timeout: 2000 }
    )
  })

  test('FAQ questions are keyboard accessible', async ({ page }) => {
    await page.goto('/')
    const firstQuestion = page.getByTestId('faq-toggle-who-can-attend')
    await firstQuestion.scrollIntoViewIfNeeded()
    await firstQuestion.focus()
    await page.keyboard.press('Enter')
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
  })
})
