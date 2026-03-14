import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const cityRoute = "/weather/%E5%8C%97%E4%BA%AC%E5%B8%82/%E5%8C%97%E4%BA%AC?qid=101010100";

const gotoRoute = async (page: Page, url: string) => {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });
};

const installSharedCityMocks = async (page: Page) => {
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
            sunrise: "06:22",
            sunset: "18:11",
            uvIndex: "5",
          },
        ],
      },
    });
  });

  await page.route("**/v7/historical/weather**", async (route) => {
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
};

test("AQI panel renders normalized metrics with comfort modules", async ({ page }) => {
  await installSharedCityMocks(page);
  await page.route("**/v7/air/now**", async (route) => {
    await route.fulfill({
      json: {
        code: "200",
        now: {
          aqi: "42",
          category: "优",
          primary: "PM2.5",
          pm2p5: "12",
          pm10: "21",
          no2: "9",
          so2: "4",
          co: "0.5",
          o3: "52",
        },
      },
    });
  });

  await gotoRoute(page, cityRoute);

  await expect(page.getByTestId("aqi-panel")).toBeVisible();
  await expect(page.getByTestId("aqi-index")).toContainText("42");
  await expect(page.getByTestId("comfort-metrics")).toBeVisible();
});

test("missing AQI variables surface an explicit unavailable state", async ({ page }) => {
  await installSharedCityMocks(page);
  await page.route("**/v7/air/now**", async (route) => {
    await route.fulfill({
      json: {
        code: "200",
        now: {},
      },
    });
  });

  await gotoRoute(page, cityRoute);

  await expect(page.getByTestId("aqi-unavailable")).toBeVisible();
  await expect(page.getByTestId("comfort-metrics")).toBeVisible();
});
