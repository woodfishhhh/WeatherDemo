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
  favoriteLocationIds: [],
  recentLocationIds: ["101010100"],
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
    windSpeed: string;
    precip: string;
  }
> = {
  "101010100": {
    temp: "23",
    feelsLike: "22",
    text: "晴",
    icon: "100",
    humidity: "31",
    windScale: "3",
    windSpeed: "12",
    precip: "0.4",
  },
  "101020100": {
    temp: "18",
    feelsLike: "16",
    text: "多云",
    icon: "101",
    humidity: "64",
    windScale: "4",
    windSpeed: "22",
    precip: "1.6",
  },
  "101280101": {
    temp: "27",
    feelsLike: "29",
    text: "阵雨",
    icon: "300",
    humidity: "76",
    windScale: "2",
    windSpeed: "10",
    precip: "6.2",
  },
};

const installHomeWorkspaceMocks = async (
  page: Page,
  options: {
    savedCities?: typeof savedCitiesEnvelope;
    workspace?: typeof workspaceState;
  } = {}
) => {
  const nextSavedCitiesEnvelope = options.savedCities ?? savedCitiesEnvelope;
  const nextWorkspaceState = options.workspace ?? workspaceState;

  await page.addInitScript(({ savedCitiesPayload, workspacePayload }) => {
    window.localStorage.setItem("savedCities", JSON.stringify(savedCitiesPayload));
    window.localStorage.setItem("weather-workspace-state", JSON.stringify(workspacePayload));
  }, {
    savedCitiesPayload: nextSavedCitiesEnvelope,
    workspacePayload: nextWorkspaceState,
  });

  await page.route("**/geo/v2/city/lookup**", async (route) => {
    const url = new URL(route.request().url());
    const location = url.searchParams.get("location") ?? "101010100";
    const savedCity = nextSavedCitiesEnvelope.cities.find((city) => city.locationId === location) ?? nextSavedCitiesEnvelope.cities[0];

    await route.fulfill({
      json: {
        code: "200",
        location: savedCity ? [
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
        ] : [],
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
          windSpeed: weather.windSpeed,
          pressure: "1014",
          vis: "20",
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
            precip: weather.precip,
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

    await route.fulfill({
      json: {
        code: "200",
        weatherDaily: {
          fxDate,
          tempMax: `${baseline + 3}`,
          tempMin: `${baseline - 2}`,
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

const installCityJourneyMocks = async (page: Page) => {
  await page.route("**/geo/v2/city/lookup**", async (route) => {
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
        hourly: Array.from({ length: 4 }, (_, index) => ({
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
        ],
      },
    });
  });

  await page.route("**/v7/historical/weather**", async (route) => {
    const url = new URL(route.request().url());
    const date = url.searchParams.get("date") ?? "20260314";
    const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

    await route.fulfill({
      json: {
        code: "200",
        weatherDaily: {
          fxDate,
          tempMax: "24",
          tempMin: "14",
          humidity: "41",
          precip: "0.0",
          textDay: "晴",
          iconDay: "100",
          windSpeedDay: "15",
        },
        weatherHourly: [
          {
            fxTime: `${fxDate}T14:00+08:00`,
            temp: "24",
            humidity: "35",
            precip: "0.0",
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

test.describe("home", () => {
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
    await page.waitForTimeout(425);
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

  test("denied current location keeps home fallback intact", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition: (_success: unknown, reject: (error: Error) => void) => {
            reject(new Error("Location permission was denied."));
          },
        },
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Use current location / 使用当前位置" }).click();

    await expect(page.getByText("Location permission was denied.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Use current location / 使用当前位置" })).toBeVisible();
    await expect(page.getByTestId("workspace-shortcuts")).toBeVisible();
    await expect(page.getByTestId("saved-locations-section")).toBeVisible();
  });

  test("opening a saved search result carries workspace continuity into city detail", async ({ page }) => {
    await page.addInitScript(({ nextSavedCitiesEnvelope, nextWorkspaceState }) => {
      window.localStorage.setItem("savedCities", JSON.stringify(nextSavedCitiesEnvelope));
      window.localStorage.setItem("weather-workspace-state", JSON.stringify(nextWorkspaceState));
    }, {
      nextSavedCitiesEnvelope: savedCitiesEnvelope,
      nextWorkspaceState: workspaceState,
    });
    await installCityJourneyMocks(page);

    await page.goto("/");
    await page.getByTestId("home-search-input").fill("beijing");

    await expect(page.getByTestId("search-results")).toBeVisible();
    await page.getByTestId("search-result-item").first().click();

    await expect(page).toHaveURL(/\/weather\/Beijing\/Beijing\?/);
    await expect(page).toHaveURL(/id=beijing/);
    await expect(page).toHaveURL(/qid=101010100/);
    await expect(page).toHaveURL(/group=recent/);
    await expect(page).toHaveURL(/compare=101010100,101020100/);
    await expect(page.getByTestId("save-city-button")).toContainText("Saved / 已收藏");
    await expect(page.getByTestId("open-workspace-button")).toBeEnabled();
  });

  test("opening a saved location card preserves home continuity into city detail", async ({ page }) => {
    await page.addInitScript(({ nextSavedCitiesEnvelope, nextWorkspaceState }) => {
      window.localStorage.setItem("savedCities", JSON.stringify(nextSavedCitiesEnvelope));
      window.localStorage.setItem("weather-workspace-state", JSON.stringify(nextWorkspaceState));
    }, {
      nextSavedCitiesEnvelope: savedCitiesEnvelope,
      nextWorkspaceState: workspaceState,
    });

    await installCityJourneyMocks(page);
    await page.goto("/");

    await expect(page.getByTestId("saved-locations-section")).toContainText("北京");
    await page.getByTestId("saved-locations-section")
      .getByTestId("city-card")
      .filter({ hasText: "北京" })
      .first()
      .click();

    await expect.poll(() => decodeURIComponent(new URL(page.url()).pathname)).toBe("/weather/北京市/北京");
    await expect(page).toHaveURL(/id=beijing/);
    await expect(page).toHaveURL(/qid=101010100/);
    await expect(page).toHaveURL(/group=all/);
    await expect(page).toHaveURL(/compare=101010100,101020100/);
    await expect(page.getByTestId("open-workspace-button")).toBeEnabled();
  });

  test("home intelligence surfaces highlight the highest-risk saved city and relaunch the compare preset", async ({ page }) => {
    await installHomeWorkspaceMocks(page);

    await page.goto("/");

    await expect(page.getByTestId("saved-city-intelligence-strip")).toContainText("广州");
    await expect(page.getByTestId("home-compare-preset")).toContainText("北京");
    await expect(page.getByTestId("home-compare-preset")).toContainText("上海");

    await page.getByTestId("home-open-compare-preset-button").click();

    await expect(page).toHaveURL(/\/workspace\?/);
    await expect(page).toHaveURL(/group=all/);
    await expect(page).toHaveURL(/compare=101010100,101020100/);
  });

  test("home intelligence shortcuts collapse safely with empty saved cities", async ({ page }) => {
    await installHomeWorkspaceMocks(page, {
      savedCities: {
        version: 2,
        cities: [],
      },
      workspace: {
        version: 1,
        favoriteLocationIds: [],
        recentLocationIds: [],
        compareLocationIds: [],
      },
    });

    await page.goto("/");

    await expect(page.getByTestId("saved-city-intelligence-fallback")).toBeVisible();
    await expect(page.getByTestId("home-search-input")).toBeVisible();
    await expect(page.getByTestId("request-current-location-button")).toBeVisible();
    await expect(page.getByTestId("home-open-compare-preset-button")).toHaveCount(0);
    await expect(page.getByTestId("home-continue-recent-button")).toHaveCount(0);
    await expect(page.getByTestId("home-intelligence-fallback")).toBeVisible();
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

    await page.route("**/v7/weather/7d**", async (route) => {
      const url = new URL(route.request().url());
      const location = url.searchParams.get("location") ?? "101010100";

      await route.fulfill({
        json: {
          code: "200",
          daily: [
            {
              fxDate: "2026-03-14",
              tempMax: location === "101020100" ? "20" : location === "101280101" ? "29" : "25",
              tempMin: location === "101020100" ? "12" : location === "101280101" ? "23" : "15",
              textDay: location === "101280101" ? "阵雨" : "晴",
              textNight: "晴",
              iconDay: location === "101280101" ? "300" : "100",
              iconNight: "150",
              windDirDay: "北风",
              windScaleDay: "3",
              humidity: location === "101020100" ? "64" : location === "101280101" ? "76" : "31",
              precip: location === "101020100" ? "1.6" : location === "101280101" ? "6.2" : "0.4",
            },
          ],
        },
      });
    });

    await page.goto("/");

    await expect(page.getByTestId("saved-locations-section")).toContainText("北京");
    await expect(page.getByTestId("saved-locations-section")).toContainText("上海");
    await expect(page.getByTestId("saved-locations-section")).toContainText("广州");
    await expect.poll(() => weatherRequestCount).toBe(3);
  });
});
