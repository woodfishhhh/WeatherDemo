import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const cityRoute = "/weather/%E5%8C%97%E4%BA%AC%E5%B8%82/%E5%8C%97%E4%BA%AC?qid=101010100";

const gotoRoute = async (page: Page, url: string) => {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });
};

const installTrendMocks = async (
  page: Page,
  options: {
    invalidHistoricalPayload?: boolean;
    missingDailyOptionalFields?: boolean;
  } = {}
) => {
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
            sunrise: options.missingDailyOptionalFields ? undefined : "06:22",
            sunset: options.missingDailyOptionalFields ? undefined : "18:11",
            uvIndex: options.missingDailyOptionalFields ? undefined : "5",
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

  await page.route("**/v7/historical/weather**", async (route) => {
    const url = new URL(route.request().url());
    const date = url.searchParams.get("date") ?? "20260313";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

    if (options.invalidHistoricalPayload) {
      await route.fulfill({
        json: {
          code: "200",
          weatherDaily: {
            fxDate,
            textDay: "晴",
            iconDay: "100",
          },
          weatherHourly: [],
        },
      });
      return;
    }

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
};

test("historical trend chart renders deterministic mocked series", async ({ page }) => {
  await installTrendMocks(page);
  await gotoRoute(page, cityRoute);

  await expect(page.getByTestId("trend-chart-temperature")).toBeVisible();
  await page.locator('[data-testid="trend-chart-temperature"] canvas').hover({ position: { x: 120, y: 120 } });
  await expect(page.getByTestId("trend-tooltip")).toBeVisible();
});

test("reduced-motion mode disables animated chart reveals", async ({ page }) => {
  await gotoRoute(page, "/");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "weather-platform-settings",
      JSON.stringify({
        temperatureUnit: "celsius",
        windUnit: "scale",
        timezonePolicy: "location",
        reducedMotion: true,
        workspaceDefaultGroup: "all",
      })
    );
  });

  await installTrendMocks(page);
  await gotoRoute(page, cityRoute);

  await expect(page.getByTestId("trend-chart-temperature")).toHaveAttribute("data-motion", "reduced");
});

test("malformed historical payload falls back to the trend unavailable state", async ({ page }) => {
  await installTrendMocks(page, { invalidHistoricalPayload: true });
  await gotoRoute(page, cityRoute);

  await expect(page.getByTestId("city-current-panel")).toBeVisible();
  await expect(page.getByTestId("trend-unavailable")).toBeVisible();
  await expect(page.getByRole("button", { name: /Retry Trends/i })).toBeVisible();
});

test("city intelligence degrades gracefully when optional datasets are unavailable", async ({ page }) => {
  await installTrendMocks(page, {
    invalidHistoricalPayload: true,
    missingDailyOptionalFields: true,
  });
  await gotoRoute(page, cityRoute);

  await expect(page.getByTestId("city-intelligence-panel")).toBeVisible();
  await expect(page.getByTestId("city-intelligence-fallback").first()).toBeVisible();
  await expect(page.getByTestId("trend-unavailable")).toBeVisible();
  await expect(page.getByTestId("city-current-panel")).toBeVisible();
});
