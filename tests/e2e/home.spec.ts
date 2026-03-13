import { expect, test } from "@playwright/test";

test("home route smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("FORECAST")).toBeVisible();
});

