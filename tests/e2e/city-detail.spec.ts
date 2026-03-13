import { expect, test } from "@playwright/test";

test("city detail route smoke", async ({ page }) => {
  await page.goto("/weather/%E5%8C%97%E4%BA%AC%E5%B8%82/%E5%8C%97%E4%BA%AC?qid=101010100");
  await expect(page.locator("body")).toContainText("北京");
});

