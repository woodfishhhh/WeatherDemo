import { describe, expect, it } from "vitest";
import { buildCityWeatherIntelligence } from "@/features/weather/utils/weatherIntelligence";
import type { CityWeatherBundle } from "@/features/weather/types";

const createWeatherBundle = (
  overrides: Partial<CityWeatherBundle> = {}
): CityWeatherBundle => ({
  location: {
    id: "101010100",
    name: "北京",
    province: "北京市",
    latitude: "39.90499",
    longitude: "116.40529",
    timezone: "Asia/Shanghai",
  },
  current: {
    observationTime: "2026-03-14T08:00+08:00",
    temperature: "30",
    feelsLike: "34",
    text: "晴",
    textBilingual: {
      en: "Sunny",
      zh: "晴",
    },
    icon: "100",
    humidity: "74",
    windDirection: "北风",
    windScale: "3",
    windSpeed: "18",
    pressure: "1014",
    visibility: "8",
  },
  hourly: [
    {
      time: "2026-03-14T09:00+08:00",
      temperature: "24",
      text: "晴",
      textBilingual: {
        en: "Sunny",
        zh: "晴",
      },
      icon: "100",
      pop: "20",
      windDirection: "北风",
      windScale: "3",
    },
    {
      time: "2026-03-14T12:00+08:00",
      temperature: "30",
      text: "多云",
      textBilingual: {
        en: "Cloudy",
        zh: "多云",
      },
      icon: "101",
      pop: "65",
      windDirection: "北风",
      windScale: "3",
    },
  ],
  daily: [
    {
      date: "2026-03-14",
      tempMax: "33",
      tempMin: "18",
      textDay: "雷阵雨",
      textDayBilingual: {
        en: "Thunder Shower",
        zh: "雷阵雨",
      },
      textNight: "多云",
      textNightBilingual: {
        en: "Cloudy",
        zh: "多云",
      },
      iconDay: "302",
      iconNight: "101",
      windDirectionDay: "北风",
      windScaleDay: "5",
      humidity: "72",
      precip: "8.5",
      sunrise: "06:22",
      sunset: "18:11",
      uvIndex: "8",
    },
  ],
  airQuality: {
    status: "available",
    data: {
      aqi: "42",
      category: "优",
      primary: "PM2.5",
      pollutants: [],
    },
  },
  ...overrides,
});

describe("buildCityWeatherIntelligence", () => {
  it("builds five deterministic intelligence cards from normalized weather data", () => {
    const intelligence = buildCityWeatherIntelligence(createWeatherBundle());

    expect(intelligence.cards).toHaveLength(5);
    expect(intelligence.cards.map((card) => card.id)).toEqual([
      "precipitation-risk",
      "temperature-swing",
      "daylight-window",
      "comfort-severity",
      "weather-watch",
    ]);
    expect(intelligence.cards.every((card) => card.status === "available")).toBe(true);
    expect(intelligence.cards[0]).toMatchObject({
      headline: "65% peak chance",
      severity: "moderate",
    });
    expect(intelligence.cards[1]).toMatchObject({
      headline: "15° swing",
      severity: "high",
    });
    expect(intelligence.cards[4]).toMatchObject({
      headline: "Watch active",
      severity: "high",
    });
  });

  it("marks optional signals as unavailable when daylight inputs are missing", () => {
    const intelligence = buildCityWeatherIntelligence(
      createWeatherBundle({
        daily: [
          {
            ...createWeatherBundle().daily[0],
            sunrise: undefined,
            sunset: undefined,
            uvIndex: undefined,
          },
        ],
      })
    );

    expect(intelligence.cards.find((card) => card.id === "daylight-window")).toMatchObject({
      status: "unavailable",
      headline: "Fallback / 已降级",
    });
    expect(intelligence.cards.find((card) => card.id === "comfort-severity")).toMatchObject({
      status: "available",
    });
  });

  it("returns an empty intelligence payload when the city bundle is unavailable", () => {
    expect(buildCityWeatherIntelligence(null)).toEqual({
      cards: [],
    });
  });
});
