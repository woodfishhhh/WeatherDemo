import { describe, expect, it } from "vitest";
import {
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
});
