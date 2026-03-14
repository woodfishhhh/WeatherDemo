import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import {
  __resetQWeatherRequestCache,
  getAirQuality,
  getCurrentWeather,
  getDailyForecast,
  getHistoricalTrends,
  getHourlyForecast,
  searchLocations,
} from "@/features/weather/services/qweather";

describe("QWeather normalization", () => {
  it("normalizes qweather payloads into canonical weather models", async () => {
    const [location] = await searchLocations("北京");
    expect(location).toBeDefined();

    if (!location) {
      throw new Error("Expected a normalized location result.");
    }

    expect(location).toMatchObject({
      id: "101010100",
      name: "北京",
      province: "北京市",
      country: "中国",
      countryCode: "CN",
      adcode: "110000",
      latitude: "39.90499",
      longitude: "116.40529",
    });

    const [current, hourly, daily, airQuality, trends] = await Promise.all([
      getCurrentWeather(location),
      getHourlyForecast(location),
      getDailyForecast(location),
      getAirQuality(location),
      getHistoricalTrends(location, {
        days: 1,
        endDate: new Date("2026-03-14T00:00:00.000Z"),
      }),
    ]);

    expect(current).toMatchObject({
      temperature: "23",
      textBilingual: {
        en: "Sunny",
        zh: "晴",
      },
      humidity: "26",
    });

    expect(hourly[0]).toMatchObject({
      temperature: "18",
      textBilingual: {
        zh: "晴",
      },
      windScale: "3",
    });
    expect(hourly).toHaveLength(8);

    expect(daily[0]).toMatchObject({
      date: "2026-03-13",
      tempMax: "24",
      tempMin: "13",
      textDayBilingual: {
        en: "Sunny",
      },
    });

    expect(airQuality).toEqual({
      status: "available",
      data: {
        aqi: "42",
        category: "优",
        primary: "PM2.5",
        pollutants: [
          { label: "PM2.5", value: "12" },
          { label: "PM10", value: "21" },
          { label: "NO2", value: "9" },
          { label: "SO2", value: "4" },
          { label: "CO", value: "0.5" },
          { label: "O3", value: "52" },
        ],
      },
    });

    expect(trends).toMatchObject({
      status: "available",
    });

    if (trends.status === "available") {
      expect(trends.data[0]).toMatchObject({
        date: "2026-03-13",
        temperatureMax: "24",
        temperatureMin: "14",
        precipitation: "1.2",
        humidity: "41",
        windSpeed: "15",
      });
    }
  });

  it("derives historical trend fallbacks from hourly payloads when daily fields are partial", async () => {
    __resetQWeatherRequestCache();
    server.use(
      http.get("https://mock-api.qweather.test/v7/historical/weather", ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") ?? "20260313";
        const fxDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

        return HttpResponse.json({
          code: "200",
          weatherDaily: {
            fxDate,
          },
          weatherHourly: [
            {
              fxTime: `${fxDate}T08:00+08:00`,
              temp: "18",
              humidity: "50",
              precip: "0.0",
              windSpeed: "10",
              text: "多云",
              icon: "101",
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
        });
      })
    );

    const [location] = await searchLocations("北京");
    expect(location).toBeDefined();

    if (!location) {
      throw new Error("Expected a normalized location result.");
    }

    const trends = await getHistoricalTrends(location, {
      days: 1,
      endDate: new Date("2026-03-14T00:00:00.000Z"),
    });

    expect(trends).toMatchObject({
      status: "available",
    });

    if (trends.status === "available") {
      expect(trends.data[0]).toEqual({
        date: "2026-03-13",
        temperatureMax: "24",
        temperatureMin: "18",
        precipitation: "1.2",
        humidity: "43",
        windSpeed: "15",
        text: "多云",
        textBilingual: {
          en: "Few Clouds",
          zh: "多云",
        },
        icon: "101",
      });
    }
  });
});
