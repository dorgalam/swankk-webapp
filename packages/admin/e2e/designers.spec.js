import { test, expect } from '@playwright/test'

test.describe('Designers', () => {
  test('designers list page loads', async ({ page }) => {
    await page.goto('/designers')
    await expect(page.getByRole('heading', { name: 'Designers' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'New Designer' })).toBeVisible()
  })

  test('new designer form has expected fields', async ({ page }) => {
    await page.goto('/designers/new')
    await expect(page.getByRole('heading', { name: 'New Designer' })).toBeVisible()

    // Basic Info fields
    await expect(page.getByLabel(/name/i).first()).toBeVisible()
    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/phonetic/i)).toBeVisible()

    // Facts fields
    await expect(page.getByLabel(/founder/i).first()).toBeVisible()
    await expect(page.getByLabel(/founded year/i)).toBeVisible()

    // Sections
    await expect(page.getByText('Known For Tags')).toBeVisible()
    await expect(page.getByText('Eras')).toBeVisible()
    await expect(page.getByText('Signature Pieces')).toBeVisible()

    // Save button
    await expect(page.getByRole('button', { name: /create designer/i })).toBeVisible()
  })

  test('navigating from list to new form', async ({ page }) => {
    await page.goto('/designers')
    await page.getByRole('button', { name: 'New Designer' }).click()
    await expect(page).toHaveURL('/designers/new')
    await expect(page.getByRole('heading', { name: 'New Designer' })).toBeVisible()
  })
})
