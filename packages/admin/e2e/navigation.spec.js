import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('sidebar navigates to Designers', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Designers' }).click()
    await expect(page).toHaveURL('/designers')
    await expect(page.getByRole('heading', { name: 'Designers' })).toBeVisible()
  })

  test('sidebar navigates to Requests', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Requests' }).click()
    await expect(page).toHaveURL('/requests')
    await expect(page.getByRole('heading', { name: 'Designer Requests' })).toBeVisible()
  })

  test('sidebar navigates to Users', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Users' }).click()
    await expect(page).toHaveURL('/users')
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  })
})
