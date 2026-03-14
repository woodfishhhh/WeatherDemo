import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const cityRoute = "/weather/%E5%8C%97%E4%BA%AC%E5%B8%82/%E5%8C%97%E4%BA%AC?qid=101010100";
const cityJourneyRoute =
  "/weather/%E5%8C%97%E4%BA%AC%E5%B8%82/%E5%8C%97%E4%BA%AC?id=beijing&qid=101010100&group=recent&compare=101010100,101020100";
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
  ],
};
const workspaceState = {
  version: 1,
  favoriteLocationIds: [],
  recentLocationIds: ["101010100", "101020100"],
  compareLocationIds: ["101010100", "101020100"],
};

const installCityMocks = async (page: Page) => {
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
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";

    await route.fulfill({
      json: {
        code: "200",
        now: {
          obsTime: "2026-03-14T08:00+08:00",
          temp: location === "101020100" ? "18" : "23",
          feelsLike: location === "101020100" ? "17" : "22",
          text: location === "101020100" ? "多云" : "晴",
          icon: location === "101020100" ? "101" : "100",
          humidity: location === "101020100" ? "64" : "30",
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
    const url = new URL(route.request().url());
    const date = url.searchParams.get("date") ?? "20260313";
    const location = url.searchParams.get("location") ?? "101010100";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const baseline = location === "101020100" ? 18 : "24";

    await route.fulfill({
      json: {
        code: "200",
        weatherDaily: {
          fxDate,
          tempMax: baseline,
          tempMin: location === "101020100" ? "12" : "14",
          humidity: location === "101020100" ? "58" : "41",
          precip: "1.2",
          textDay: location === "101020100" ? "多云" : "晴",
          iconDay: location === "101020100" ? "101" : "100",
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

test("city intelligence page renders current, hourly, and daily modules", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await installCityMocks(page);
  await page.goto(cityRoute);

  await expect(page.getByTestId("city-current-panel")).toBeVisible();
  await expect(page.getByTestId("city-hourly-strip")).toBeVisible();
  await expect(page.getByTestId("city-daily-grid")).toBeVisible();
  await expect(page.getByTestId("city-current-panel")).toContainText("23°C");
});

test("save toggle persists through reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await installCityMocks(page);
  await page.goto(cityRoute);

  await page.getByTestId("save-city-button").click();
  await expect(page.getByTestId("saved-state-badge")).toBeVisible();

  await page.reload();

  await expect(page.getByTestId("save-city-button")).toContainText("Saved / 已收藏");
  await expect(page.getByTestId("saved-state-badge")).toBeVisible();
});

test("city detail continues into workspace with the same journey query", async ({ page }) => {
  await page.addInitScript(({ nextSavedCitiesEnvelope, nextWorkspaceState }) => {
    window.localStorage.setItem("savedCities", JSON.stringify(nextSavedCitiesEnvelope));
    window.localStorage.setItem("weather-workspace-state", JSON.stringify(nextWorkspaceState));
  }, {
    nextSavedCitiesEnvelope: savedCitiesEnvelope,
    nextWorkspaceState: workspaceState,
  });
  await installCityMocks(page);
  await page.goto(cityJourneyRoute);

  await expect(page.getByTestId("open-workspace-button")).toBeEnabled();
  await page.getByTestId("open-workspace-button").click();

  await expect(page).toHaveURL(/\/workspace\?group=recent&compare=101010100,101020100/);
  await expect(page.getByTestId("workspace-heading")).toBeVisible();
  await expect(page.getByTestId("workspace-filter-group")).toHaveValue("recent");
});
