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
  ],
};

const workspaceState = {
  version: 1,
  favoriteLocationIds: ["101010100", "101020100"],
  recentLocationIds: ["101020100"],
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

  await page.route("**/v7/historical/weather**", async (route) => {
    const url = new URL(route.request().url());
    const date = url.searchParams.get("date") ?? "20260314";
    const location = url.searchParams.get("location") ?? "101010100";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const baseline = location === "101020100" ? 16 : 21;
    const dayOffset = Number.parseInt(date.slice(-2), 10) % 3;

    await route.fulfill({
      json: {
        code: "200",
        weatherDaily: {
          fxDate,
          tempMax: `${baseline + 3 + dayOffset}`,
          tempMin: `${baseline - 2 + dayOffset}`,
          humidity: location === "101020100" ? "62" : "45",
          precip: "0.4",
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
            precip: "0.3",
            windSpeed: location === "101020100" ? "18" : "12",
            text: location === "101020100" ? "多云" : "晴",
            icon: location === "101020100" ? "101" : "100",
          },
        ],
      },
    });
  });
};

test("unit and motion preferences persist and affect workspace output", async ({ page }) => {
  await installWorkspaceMocks(page);
  await page.goto("/settings");

  await page.getByTestId("temperature-unit-toggle").selectOption("fahrenheit");
  await page.getByTestId("reduced-motion-toggle").selectOption("on");
  await page.getByTestId("workspace-default-group-toggle").selectOption("favorites");

  await expect(page.getByTestId("settings-preview-temperature")).toContainText("73°F");

  await page.reload();

  await expect(page.getByTestId("temperature-unit-toggle")).toHaveValue("fahrenheit");
  await expect(page.getByTestId("reduced-motion-toggle")).toHaveValue("on");
  await expect(page.getByTestId("workspace-default-group-toggle")).toHaveValue("favorites");

  await page.goto("/workspace");

  await expect(page.getByTestId("workspace-filter-group")).toHaveValue("favorites");
  await expect(page).toHaveURL(/group=favorites/);
  await expect(page.getByTestId("workspace-city-card").first()).toContainText("73°F");
  await expect(page.getByTestId("workspace-trend-panel").first()).toHaveAttribute("data-motion", "reduced");
});

test("invalid persisted settings fall back safely", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("weather-platform-settings", "{ invalid-json");
  });

  await page.goto("/settings");

  await expect(page.getByTestId("settings-heading")).toBeVisible();
  await expect(page.getByTestId("temperature-unit-toggle")).toHaveValue("celsius");
  await expect(page.getByTestId("wind-unit-toggle")).toHaveValue("scale");
  await expect(page.getByTestId("timezone-policy-toggle")).toHaveValue("location");
  await expect(page.getByTestId("reduced-motion-toggle")).toHaveValue("system");
  await expect(page.getByTestId("workspace-default-group-toggle")).toHaveValue("all");
});
