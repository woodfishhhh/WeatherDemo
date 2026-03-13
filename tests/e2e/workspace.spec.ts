import { expect, test } from "@playwright/test";

test("workspace route smoke", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByTestId("workspace-heading")).toBeVisible();
});

