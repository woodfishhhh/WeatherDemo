import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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

const workspaceState = {
  version: 1,
  favoriteLocationIds: ["101010100", "101020100"],
  recentLocationIds: ["101020100", "101280101"],
  compareLocationIds: ["101010100", "101020100"],
};

const weatherByLocation: Record<
  string,
  {
    temp: string;
    feelsLike: string;
    text: string;
    icon: string;
    humidity: string;
    windScale: string;
  }
> = {
  "101010100": {
    temp: "23",
    feelsLike: "22",
    text: "晴",
    icon: "100",
    humidity: "31",
    windScale: "3",
  },
  "101020100": {
    temp: "18",
    feelsLike: "16",
    text: "多云",
    icon: "101",
    humidity: "64",
    windScale: "4",
  },
  "101280101": {
    temp: "27",
    feelsLike: "29",
    text: "阵雨",
    icon: "300",
    humidity: "76",
    windScale: "2",
  },
};

const installWorkspaceMocks = async (page: Page) => {
  await page.addInitScript(
    ({ nextSavedCitiesEnvelope, nextWorkspaceState }) => {
      window.localStorage.setItem("savedCities", JSON.stringify(nextSavedCitiesEnvelope));
      window.localStorage.setItem("weather-workspace-state", JSON.stringify(nextWorkspaceState));
    },
    {
      nextSavedCitiesEnvelope: savedCitiesEnvelope,
      nextWorkspaceState: workspaceState,
    }
  );

  await page.route("**/geo/v2/city/lookup**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";
    const savedCity = savedCitiesEnvelope.cities.find((city) => city.locationId === location) ?? savedCitiesEnvelope.cities[0];

    await route.fulfill({
      json: {
        code: "200",
        location: [
          {
            id: savedCity.locationId,
            name: savedCity.city,
            adm1: savedCity.province,
            adm2: savedCity.city,
            country: savedCity.country,
            countryCode: savedCity.countryCode,
            lat: savedCity.latitude,
            lon: savedCity.longitude,
            adcode: savedCity.adcode,
          },
        ],
      },
    });
  });

  await page.route("**/v7/weather/now**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";
    const weather = weatherByLocation[location] ?? weatherByLocation["101010100"];

    await route.fulfill({
      json: {
        code: "200",
        now: {
          obsTime: "2026-03-14T08:00+08:00",
          temp: weather.temp,
          feelsLike: weather.feelsLike,
          text: weather.text,
          icon: weather.icon,
          humidity: weather.humidity,
          windDir: "北风",
          windScale: weather.windScale,
          windSpeed: "12",
          pressure: "1014",
          vis: "18",
        },
      },
    });
  });

  await page.route("**/v7/weather/24h**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";
    const weather = weatherByLocation[location] ?? weatherByLocation["101010100"];

    await route.fulfill({
      json: {
        code: "200",
        hourly: Array.from({ length: 4 }, (_, index) => ({
          fxTime: `2026-03-14T${String(8 + index).padStart(2, "0")}:00+08:00`,
          temp: `${Number.parseInt(weather.temp, 10) + index}`,
          text: weather.text,
          icon: weather.icon,
          pop: `${index * 5}`,
          windDir: "北风",
          windScale: weather.windScale,
        })),
      },
    });
  });

  await page.route("**/v7/weather/7d**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";
    const weather = weatherByLocation[location] ?? weatherByLocation["101010100"];

    await route.fulfill({
      json: {
        code: "200",
        daily: [
          {
            fxDate: "2026-03-14",
            tempMax: `${Number.parseInt(weather.temp, 10) + 2}`,
            tempMin: `${Number.parseInt(weather.temp, 10) - 8}`,
            textDay: weather.text,
            textNight: "晴",
            iconDay: weather.icon,
            iconNight: "150",
            windDirDay: "北风",
            windScaleDay: weather.windScale,
            humidity: weather.humidity,
            precip: "0.0",
          },
        ],
      },
    });
  });

  await page.route("**/v7/historical/weather**", async (route) => {
    const url = new URL(route.request().url());
    const date = url.searchParams.get("date") ?? "20260314";
    const location = url.searchParams.get("location") ?? "101010100";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const baseline = location === "101020100" ? 16 : location === "101280101" ? 24 : 21;
    const dayOffset = Number.parseInt(date.slice(-2), 10) % 3;

    await route.fulfill({
      json: {
        code: "200",
        weatherDaily: {
          fxDate,
          tempMax: `${baseline + 3 + dayOffset}`,
          tempMin: `${baseline - 2 + dayOffset}`,
          humidity: location === "101020100" ? "62" : "45",
          precip: location === "101280101" ? "2.4" : "0.4",
          textDay: location === "101020100" ? "多云" : "晴",
          iconDay: location === "101020100" ? "101" : "100",
          windSpeedDay: location === "101020100" ? "18" : "12",
        },
        weatherHourly: [
          {
            fxTime: `${fxDate}T08:00+08:00`,
            temp: `${baseline}`,
            humidity: location === "101020100" ? "68" : "50",
            precip: "0.0",
            windSpeed: "9",
            text: location === "101020100" ? "多云" : "晴",
            icon: location === "101020100" ? "101" : "100",
          },
          {
            fxTime: `${fxDate}T14:00+08:00`,
            temp: `${baseline + 4 + dayOffset}`,
            humidity: location === "101020100" ? "60" : "39",
            precip: location === "101280101" ? "2.4" : "0.3",
            windSpeed: location === "101020100" ? "18" : "12",
            text: location === "101020100" ? "多云" : "晴",
            icon: location === "101020100" ? "101" : "100",
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

test("workspace dashboard renders grouped multi-city monitoring", async ({ page }) => {
  await installWorkspaceMocks(page);
  await page.goto("/workspace?group=all&compare=101010100,101020100");

  await expect(page.getByTestId("workspace-heading")).toBeVisible();
  await expect(page.getByTestId("workspace-groups")).toBeVisible();
  await expect(page.getByTestId("compare-panel")).toBeVisible();
  await expect(page.getByTestId("workspace-city-card")).toHaveCount(3);
  await expect(page.getByTestId("workspace-trend-panel").first()).toBeVisible();
  await expect(page.getByTestId("compare-panel")).toContainText("上海");
});

test("workspace filters round-trip through the URL query string", async ({ page }) => {
  await installWorkspaceMocks(page);
  await page.goto("/workspace?group=all&compare=101010100,101020100");

  await page.getByTestId("workspace-filter-group").selectOption("favorites");
  await expect(page).toHaveURL(/group=favorites/);
  await expect(page.getByTestId("workspace-city-card")).toHaveCount(2);

  await page.reload();

  await expect(page.getByTestId("workspace-filter-group")).toHaveValue("favorites");
  await expect(page).toHaveURL(/group=favorites/);
  await expect(page.getByTestId("workspace-city-card")).toHaveCount(2);
});

test("opening a workspace card keeps the active group and compare query on city detail", async ({ page }) => {
  await installWorkspaceMocks(page);
  await page.goto("/workspace?group=favorites&compare=101010100,101020100");

  await page.getByTestId("workspace-city-card").filter({ hasText: "上海" }).click();

  await expect(page).toHaveURL(/id=shanghai/);
  await expect(page).toHaveURL(/qid=101020100/);
  await expect(page).toHaveURL(/group=favorites/);
  await expect(page).toHaveURL(/compare=101010100,101020100/);
  await expect(page.getByTestId("open-workspace-button")).toBeEnabled();
});
