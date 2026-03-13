import { expect, test } from "@playwright/test";

test("settings route smoke", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByTestId("settings-heading")).toBeVisible();
});
