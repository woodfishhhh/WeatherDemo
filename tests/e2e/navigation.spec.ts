import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const cityRoute = "/weather/%E5%8C%97%E4%BA%AC%E5%B8%82/%E5%8C%97%E4%BA%AC?qid=101010100";

const installCityMocks = async (page: Page, options?: { failHistorical?: boolean }) => {
  await page.route("**/geo/v2/city/lookup**", async (route) => {
    await route.fulfill({
      json: {
        code: "200",
        location: [
          {
            id: "101010100",
            name: "北京",
            adm1: "北京市",
            adm2: "北京",
            country: "中国",
            countryCode: "CN",
            lat: "39.90499",
            lon: "116.40529",
            adcode: "110000",
          },
        ],
      },
    });
  });

  await page.route("**/v7/weather/now**", async (route) => {
    await route.fulfill({
      json: {
        code: "200",
        now: {
          obsTime: "2026-03-14T08:00+08:00",
          temp: "23",
          feelsLike: "22",
          text: "晴",
          icon: "100",
          humidity: "30",
          windDir: "北风",
          windScale: "3",
          windSpeed: "12",
          pressure: "1014",
          vis: "20",
        },
      },
    });
  });

  await page.route("**/v7/weather/24h**", async (route) => {
    await route.fulfill({
      json: {
        code: "200",
        hourly: Array.from({ length: 8 }, (_, index) => ({
          fxTime: `2026-03-14T${String(8 + index).padStart(2, "0")}:00+08:00`,
          temp: `${20 + index}`,
          text: "晴",
          icon: "100",
          pop: `${index * 5}`,
          windDir: "北风",
          windScale: "3",
        })),
      },
    });
  });

  await page.route("**/v7/weather/7d**", async (route) => {
    await route.fulfill({
      json: {
        code: "200",
        daily: [
          {
            fxDate: "2026-03-14",
            tempMax: "24",
            tempMin: "13",
            textDay: "晴",
            textNight: "多云",
            iconDay: "100",
            iconNight: "101",
            windDirDay: "北风",
            windScaleDay: "3",
            humidity: "35",
            precip: "0.0",
          },
          {
            fxDate: "2026-03-15",
            tempMax: "25",
            tempMin: "14",
            textDay: "多云",
            textNight: "晴",
            iconDay: "101",
            iconNight: "150",
            windDirDay: "北风",
            windScaleDay: "3",
            humidity: "40",
            precip: "0.0",
          },
        ],
      },
    });
  });

  await page.route("**/v7/historical/weather**", async (route) => {
    if (options?.failHistorical) {
      await route.fulfill({
        status: 503,
        json: {
          error: {
            title: "Historical data unavailable",
          },
        },
      });
      return;
    }

    const url = new URL(route.request().url());
    const date = url.searchParams.get("date") ?? "20260313";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

    await route.fulfill({
      json: {
        code: "200",
        weatherDaily: {
          fxDate,
          tempMax: "24",
          tempMin: "14",
          humidity: "41",
          precip: "1.2",
          textDay: "晴",
          iconDay: "100",
          windSpeedDay: "15",
        },
        weatherHourly: [
          {
            fxTime: `${fxDate}T08:00+08:00`,
            temp: "18",
            humidity: "50",
            precip: "0.0",
            windSpeed: "10",
            text: "晴",
            icon: "100",
          },
          {
            fxTime: `${fxDate}T14:00+08:00`,
            temp: "24",
            humidity: "35",
            precip: "1.2",
            windSpeed: "15",
            text: "晴",
            icon: "100",
          },
        ],
      },
    });
  });

  await page.route("**/v7/air/now**", async (route) => {
    await route.fulfill({
      status: 403,
      json: {
        error: {
          title: "Forbidden",
        },
      },
    });
  });
};

test("navigation exposes new routes while preserving brand shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("site-navigation")).toBeVisible();

  await page.getByTestId("nav-workspace-link").click();
  await expect(page).toHaveURL(/\/workspace/);
  await expect(page.getByTestId("workspace-heading")).toBeVisible();

  await page.getByTestId("nav-settings-link").click();
  await expect(page).toHaveURL(/\/settings/);
  await expect(page.getByTestId("settings-heading")).toBeVisible();

  await page.getByTestId("nav-about-button").click();
  await expect(page.getByRole("heading", { name: /concept/i })).toBeVisible();
});

test("shared empty and error states render consistently", async ({ page }) => {
  await page.goto("/workspace");

  await expect(page.getByTestId("empty-state").first()).toBeVisible();

  await installCityMocks(page, { failHistorical: true });
  await page.goto(cityRoute);

  await expect(page.getByTestId("city-current-panel")).toBeVisible();
  await expect(page.getByTestId("error-state").first()).toBeVisible();
});
