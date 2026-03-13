import { expect, test } from '@playwright/test';

test('workspace dashboard harness currently falls back to not found until the route exists', async ({ page }) => {
  await page.goto('/workspace');

  await expect(page.getByRole('heading', { name: 'Forecast not found.' })).toBeVisible();
  await expect(page.getByText('/workspace')).toBeVisible();
});
