import { expect, test } from '@playwright/test';

test('city detail smoke route resolves to the current city view shell', async ({ page }) => {
  await page.goto('/weather/Zhejiang/Hangzhou');

  await expect(page.getByText('No data available for this region')).toBeVisible();
});
