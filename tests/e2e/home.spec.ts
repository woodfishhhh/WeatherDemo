import { expect, test } from "@playwright/test";

const savedCitiesEnvelope = {
  version: 2,
  cities: [
    {
      id: "beijing",
      province: "北京市",
      city: "北京",
      adcode: "110000",
      locationId: "101010100",
      latitude: "39.90499",
      longitude: "116.40529",
      timezone: "Asia/Shanghai",
      country: "中国",
      countryCode: "CN",
    },
    {
      id: "shanghai",
      province: "上海市",
      city: "上海",
      adcode: "310000",
      locationId: "101020100",
      latitude: "31.23037",
      longitude: "121.47370",
      timezone: "Asia/Shanghai",
      country: "中国",
      countryCode: "CN",
    },
    {
      id: "guangzhou",
      province: "广东省",
      city: "广州",
      adcode: "440100",
      locationId: "101280101",
      latitude: "23.12911",
      longitude: "113.26438",
      timezone: "Asia/Shanghai",
      country: "中国",
      countryCode: "CN",
    },
  ],
};

test("typing rapidly only shows the latest suggestion set", async ({ page }) => {
  await page.route("**/geo/v2/city/lookup**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location");

    if (location === "bei") {
      await new Promise((resolve) => setTimeout(resolve, 450));
      await route.fulfill({
        json: {
          code: "200",
          location: [
            {
              id: "450500",
              name: "Beihai",
              adm1: "Guangxi",
              adm2: "Beihai",
              country: "China",
              lat: "21.48",
              lon: "109.12",
            },
          ],
        },
      });
      return;
    }

    if (location === "beijing") {
      await route.fulfill({
        json: {
          code: "200",
          location: [
            {
              id: "101010100",
              name: "Beijing",
              adm1: "Beijing",
              adm2: "Beijing",
              country: "China",
              lat: "39.90",
              lon: "116.40",
            },
          ],
        },
      });
      return;
    }

    await route.fulfill({ json: { code: "200", location: [] } });
  });

  await page.goto("/");
  await page.getByTestId("home-search-input").fill("bei");
  await page.getByTestId("home-search-input").fill("beijing");

  await expect(page.getByTestId("search-results")).toBeVisible();
  await expect(page.getByTestId("search-results")).toContainText("Beijing");
  await expect(page.getByTestId("search-results")).not.toContainText("Beihai");
  await expect(page.getByTestId("workspace-shortcuts")).toBeVisible();
});

test("provider failure surfaces a controlled search error state", async ({ page }) => {
  await page.route("**/geo/v2/city/lookup**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location");

    if (location === "shanghai") {
      await route.fulfill({
        status: 500,
        json: {
          error: {
            title: "Search failed",
          },
        },
      });
      return;
    }

    await route.fallback();
  });

  await page.goto("/");
  await page.getByTestId("home-search-input").fill("shanghai");

  await expect(page.getByTestId("search-error")).toBeVisible();
  await expect(page.getByTestId("saved-locations-section")).toBeVisible();
});

test("saved-location hydration keeps weather summary requests bounded per render", async ({ page }) => {
  let weatherRequestCount = 0;

  await page.addInitScript(({ nextSavedCitiesEnvelope }) => {
    window.localStorage.setItem("savedCities", JSON.stringify(nextSavedCitiesEnvelope));
  }, { nextSavedCitiesEnvelope: savedCitiesEnvelope });

  await page.route("**/v7/weather/now**", async (route) => {
    weatherRequestCount += 1;
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";

    await route.fulfill({
      json: {
        code: "200",
        now: {
          obsTime: "2026-03-14T08:00+08:00",
          temp: location === "101020100" ? "18" : location === "101280101" ? "27" : "23",
          feelsLike: "22",
          text: location === "101280101" ? "阵雨" : "晴",
          icon: location === "101280101" ? "300" : "100",
          humidity: location === "101020100" ? "64" : "31",
          windDir: "北风",
          windScale: "3",
          windSpeed: "12",
          pressure: "1014",
          vis: "18",
        },
      },
    });
  });

  await page.goto("/");

  await expect(page.getByTestId("saved-locations-section")).toContainText("北京");
  await expect(page.getByTestId("saved-locations-section")).toContainText("上海");
  await expect(page.getByTestId("saved-locations-section")).toContainText("广州");
  await expect.poll(() => weatherRequestCount).toBe(3);
});
