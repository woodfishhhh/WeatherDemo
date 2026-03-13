import { expect, test } from '@playwright/test';

test('home smoke route renders the search entry point', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByPlaceholder('Enter location...')).toBeVisible();
  await expect(page.getByText('Saved Locations')).toBeVisible();
});
