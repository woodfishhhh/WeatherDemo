import { expect, test } from '@playwright/test';

test('settings harness currently falls back to not found until the route exists', async ({ page }) => {
  await page.goto('/settings');

  await expect(page.getByRole('heading', { name: 'Forecast not found.' })).toBeVisible();
  await expect(page.getByText('/settings')).toBeVisible();
});
