import { describe, expect, it } from "vitest";
import { buildComfortMetrics } from "@/features/air-quality/utils/comfortMetrics";
import type { CityWeatherBundle } from "@/features/weather/types";

const bundle: CityWeatherBundle = {
  location: {
    id: "101010100",
    name: "北京",
    province: "北京市",
    latitude: "39.90499",
    longitude: "116.40529",
  },
  current: {
    observationTime: "2026-03-14T08:00+08:00",
    temperature: "23",
    feelsLike: "22",
    text: "晴",
    textBilingual: { en: "Sunny", zh: "晴" },
    icon: "100",
    humidity: "30",
    windDirection: "北风",
    windScale: "3",
    windSpeed: "12",
    pressure: "1014",
    visibility: "20",
  },
  hourly: [],
  daily: [
    {
      date: "2026-03-14",
      tempMax: "24",
      tempMin: "13",
      textDay: "晴",
      textDayBilingual: { en: "Sunny", zh: "晴" },
      textNight: "多云",
      textNightBilingual: { en: "Few Clouds", zh: "多云" },
      iconDay: "100",
      iconNight: "101",
      windDirectionDay: "北风",
      windScaleDay: "3",
      humidity: "35",
      precip: "0.0",
      sunrise: "06:22",
      sunset: "18:11",
      uvIndex: "5",
    },
  ],
  airQuality: {
    status: "unavailable",
    data: null,
    reason: "Not needed for this unit test.",
  },
};

describe("buildComfortMetrics", () => {
  it("derives comfort metrics from current and daily weather data", () => {
    const metrics = buildComfortMetrics(bundle);

    expect(metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "feels-like",
          value: "22°",
          status: "available",
        }),
        expect.objectContaining({
          id: "uv-index",
          value: "5",
          status: "available",
        }),
        expect.objectContaining({
          id: "daylight",
          value: "11h 49m",
          status: "available",
        }),
      ])
    );
  });

  it("surfaces explicit unavailable states when optional comfort variables are missing", () => {
    const firstDay = bundle.daily[0]!;
    const metrics = buildComfortMetrics({
      ...bundle,
      daily: [
        {
          date: firstDay.date,
          tempMax: firstDay.tempMax,
          tempMin: firstDay.tempMin,
          textDay: firstDay.textDay,
          textDayBilingual: firstDay.textDayBilingual,
          textNight: firstDay.textNight,
          textNightBilingual: firstDay.textNightBilingual,
          iconDay: firstDay.iconDay,
          iconNight: firstDay.iconNight,
          windDirectionDay: firstDay.windDirectionDay,
          windScaleDay: firstDay.windScaleDay,
          humidity: firstDay.humidity,
          precip: firstDay.precip,
          sunrise: undefined,
          sunset: undefined,
          uvIndex: undefined,
        },
      ],
    });

    expect(metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "uv-index",
          value: "--",
          status: "unavailable",
        }),
        expect.objectContaining({
          id: "daylight",
          value: "--",
          status: "unavailable",
        }),
      ])
    );
  });
});
