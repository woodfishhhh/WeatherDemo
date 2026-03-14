import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import {
  getCurrentWeather,
  getHistoricalTrends,
  QWeatherAdapterError,
  searchLocations,
} from "@/features/weather/services/qweather";

describe("QWeather provider error handling", () => {
  it("throws typed adapter errors for malformed current weather payloads", async () => {
    server.use(
      http.get("https://mock-api.qweather.test/v7/weather/now", () =>
        HttpResponse.json({
          code: "200",
          now: {
            text: "晴",
            icon: "100",
          },
        })
      )
    );

    const [location] = await searchLocations("北京");
    expect(location).toBeDefined();

    if (!location) {
      throw new Error("Expected a normalized location result.");
    }

    await expect(getCurrentWeather(location)).rejects.toBeInstanceOf(QWeatherAdapterError);
    await expect(getCurrentWeather(location)).rejects.toMatchObject({
      dataset: "current",
      code: "invalid-payload",
    });
  });

  it("returns a typed unavailable state when historical data is blocked by provider access", async () => {
    server.use(
      http.get("https://mock-api.qweather.test/v7/historical/weather", () =>
        HttpResponse.json(
          {
            error: {
              status: 403,
              title: "Forbidden",
            },
          },
          { status: 403 }
        )
      )
    );

    const [location] = await searchLocations("北京");
    expect(location).toBeDefined();

    if (!location) {
      throw new Error("Expected a normalized location result.");
    }

    const result = await getHistoricalTrends(location, {
      days: 1,
      endDate: new Date("2026-03-14T00:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "unavailable",
      data: null,
    });
  });

  it("throws typed adapter errors for malformed historical payloads", async () => {
    server.use(
      http.get("https://mock-api.qweather.test/v7/historical/weather", () =>
        HttpResponse.json({
          code: "200",
          weatherDaily: {
            fxDate: "2026-03-13",
          },
        })
      )
    );

    const [location] = await searchLocations("北京");
    expect(location).toBeDefined();

    if (!location) {
      throw new Error("Expected a normalized location result.");
    }

    await expect(
      getHistoricalTrends(location, {
        days: 1,
        endDate: new Date("2026-03-14T00:00:00.000Z"),
      })
    ).rejects.toMatchObject({
      dataset: "historical-trends",
      code: "invalid-payload",
    });
  });
});
