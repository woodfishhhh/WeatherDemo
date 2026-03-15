import { describe, expect, it } from "vitest";
import type { SavedCity } from "@/features/locations/services/persistence";
import type { SavedCityWeatherSummary } from "@/features/weather/types";
import {
  buildHighestRiskSavedCity,
  buildHomeComparePreset,
} from "@/features/home/utils/homeWorkspaceIntelligence";

const createSavedCity = (locationId: string, city: string): SavedCity => ({
  id: `${locationId}-saved`,
  locationId,
  city,
  province: `${city}市`,
  latitude: "39.90499",
  longitude: "116.40529",
  timezone: "Asia/Shanghai",
});

const createSummary = (overrides: Partial<SavedCityWeatherSummary> = {}): SavedCityWeatherSummary => ({
  temperature: "23",
  text: "晴",
  textBilingual: {
    en: "Sunny",
    zh: "晴",
  },
  icon: "100",
  humidity: "31",
  windScale: "3",
  windSpeed: "12",
  precipitation: "0.4",
  province: "北京市",
  ...overrides,
});

describe("homeWorkspaceIntelligence", () => {
  it("selects the strongest saved-city signal as the home intelligence summary", () => {
    const beijing = createSavedCity("101010100", "北京");
    const guangzhou = createSavedCity("101280101", "广州");

    const intelligence = buildHighestRiskSavedCity([
      {
        city: beijing,
        summary: createSummary(),
      },
      {
        city: guangzhou,
        summary: createSummary({
          temperature: "29",
          text: "阵雨",
          icon: "300",
          humidity: "76",
          windSpeed: "18",
          precipitation: "6.2",
          province: "广东省",
        }),
      },
    ]);

    expect(intelligence).toMatchObject({
      city: expect.objectContaining({ city: "广州" }),
      severity: "high",
    });
    expect(intelligence?.detail).toContain("Precip 6.2 mm");
  });

  it("returns no saved-city intelligence when summaries are unavailable", () => {
    const beijing = createSavedCity("101010100", "北京");

    expect(
      buildHighestRiskSavedCity([
        {
          city: beijing,
          summary: undefined,
        },
      ])
    ).toBeNull();
  });

  it("builds a persisted compare preset only when two or more compare cities exist", () => {
    const beijing = createSavedCity("101010100", "北京");
    const shanghai = createSavedCity("101020100", "上海");

    expect(buildHomeComparePreset([beijing])).toBeNull();
    expect(buildHomeComparePreset([beijing, shanghai])).toMatchObject({
      label: "北京 · 上海",
      cityNames: ["北京", "上海"],
      compareQuery: "101010100,101020100",
    });
  });
});
