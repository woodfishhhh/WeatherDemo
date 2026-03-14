import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import type { LocationRecord } from "@/features/weather/types";

const mockQWeatherEnv = () => {
  vi.doMock("@/config/env", () => ({
    appEnv: {
      firebase: {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: undefined,
      },
      qweather: {
        apiKey: "",
        apiHost: "https://mock-api.qweather.test",
        geoBaseUrl: "https://mock-api.qweather.test/geo",
        weatherBaseUrl: "https://mock-api.qweather.test",
        iconBaseUrl: "https://icons.qweather.com/assets/icons",
      },
    },
    hasFirebaseConfig: () => false,
    hasQWeatherApiKey: () => false,
    isPlaceholderFirebaseValue: () => false,
  }));
};

describe("QWeather secretless mocked flows", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.doUnmock("@/config/env");
  });

  it("allows mocked location lookups without a configured API key", async () => {
    mockQWeatherEnv();

    let observedApiKeyHeader: string | null = "not-called";

    server.use(
      http.get("https://mock-api.qweather.test/geo/v2/city/lookup", ({ request }) => {
        observedApiKeyHeader = request.headers.get("X-QW-Api-Key");

        return HttpResponse.json({
          code: "200",
          location: [
            {
              id: "101010100",
              name: "北京",
              adm1: "北京市",
              adm2: "北京",
              country: "中国",
              countryCode: "CN",
              tz: "Asia/Shanghai",
              lat: "39.90499",
              lon: "116.40529",
              adcode: "110000",
            },
          ],
        });
      })
    );

    const { __resetQWeatherRequestCache, searchLocations } = await import("@/features/weather/services/qweather");
    __resetQWeatherRequestCache();

    const results = await searchLocations("北京");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "101010100",
      name: "北京",
      province: "北京市",
    });
    expect(observedApiKeyHeader).toBeNull();
  });

  it("allows mocked current weather requests without a configured API key", async () => {
    mockQWeatherEnv();

    let observedApiKeyHeader: string | null = "not-called";

    server.use(
      http.get("https://mock-api.qweather.test/v7/weather/now", ({ request }) => {
        observedApiKeyHeader = request.headers.get("X-QW-Api-Key");

        return HttpResponse.json({
          code: "200",
          now: {
            obsTime: "2026-03-14T08:00+08:00",
            temp: "23",
            feelsLike: "22",
            text: "晴",
            icon: "100",
            humidity: "31",
            windDir: "北风",
            windScale: "3",
            windSpeed: "12",
            pressure: "1014",
            vis: "18",
          },
        });
      })
    );

    const { __resetQWeatherRequestCache, getCurrentWeather } = await import("@/features/weather/services/qweather");
    __resetQWeatherRequestCache();

    const location: LocationRecord = {
      id: "101010100",
      name: "北京",
      province: "北京市",
      latitude: "39.90499",
      longitude: "116.40529",
      timezone: "Asia/Shanghai",
    };

    const current = await getCurrentWeather(location);

    expect(current).toMatchObject({
      temperature: "23",
      text: "晴",
      icon: "100",
    });
    expect(observedApiKeyHeader).toBeNull();
  });
});
