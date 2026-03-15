import type { SavedCity } from "@/features/locations/services/persistence";
import type { SavedCityWeatherSummary, WeatherIntelligenceSeverity } from "@/features/weather/types";
import { getSavedCityLocationId } from "@/features/weather/utils/savedCityLocation";

export type HomeSavedCityIntelligence = {
  city: SavedCity;
  severity: WeatherIntelligenceSeverity;
  summaryEn: string;
  summaryZh: string;
  detail: string;
};

export type HomeComparePreset = {
  label: string;
  cityNames: string[];
  compareQuery: string;
  descriptionEn: string;
  descriptionZh: string;
};

type SavedCitySummaryRecord = {
  city: SavedCity;
  summary: SavedCityWeatherSummary | null | undefined;
};

const SEVERE_WEATHER_ICONS = new Set([
  "302",
  "303",
  "304",
  "307",
  "308",
  "310",
  "311",
  "312",
  "313",
  "403",
  "409",
  "804",
  "805",
  "806",
  "807",
]);

const MODERATE_WEATHER_ICONS = new Set([
  "300",
  "301",
  "305",
  "306",
  "309",
  "314",
  "315",
  "400",
  "401",
  "404",
  "405",
  "406",
  "407",
  "456",
  "457",
  "500",
  "501",
  "502",
  "509",
  "511",
  "512",
  "802",
  "803",
]);

const toNumber = (value?: string): number | null => {
  if (!value || value === "--") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const scoreSavedCityRisk = (summary: SavedCityWeatherSummary) => {
  const precipitation = toNumber(summary.precipitation);
  const humidity = toNumber(summary.humidity);
  const windSpeed = toNumber(summary.windSpeed);
  const windScale = toNumber(summary.windScale);
  const temperature = toNumber(summary.temperature);
  const weatherText = summary.text;
  const severePattern = /雷|暴雨|暴雪|冰雹|飓风|沙尘暴|storm|hail|hurricane|blizzard|sandstorm|thunder/i;
  const moderatePattern = /雨|雪|雾|霾|风|rain|snow|fog|haze|wind/i;

  let score = 0;

  if ((precipitation ?? 0) >= 5) {
    score += 4;
  } else if ((precipitation ?? 0) >= 1) {
    score += 2;
  }

  if ((humidity ?? 0) >= 75) {
    score += 2;
  } else if ((humidity ?? 0) >= 60) {
    score += 1;
  }

  if ((windSpeed ?? 0) >= 25 || (windScale ?? 0) >= 6) {
    score += 2;
  } else if ((windSpeed ?? 0) >= 15 || (windScale ?? 0) >= 4) {
    score += 1;
  }

  if ((temperature ?? Number.NaN) >= 32 || (temperature ?? Number.NaN) <= 0) {
    score += 2;
  } else if ((temperature ?? Number.NaN) >= 28 || (temperature ?? Number.NaN) <= 5) {
    score += 1;
  }

  if (SEVERE_WEATHER_ICONS.has(summary.icon) || severePattern.test(weatherText)) {
    score += 3;
  } else if (MODERATE_WEATHER_ICONS.has(summary.icon) || moderatePattern.test(weatherText)) {
    score += 1;
  }

  const severity: WeatherIntelligenceSeverity = score >= 7 ? "high" : score >= 4 ? "moderate" : "low";
  const detail = [
    precipitation !== null ? `Precip ${precipitation.toFixed(1)} mm` : null,
    humidity !== null ? `Humidity ${Math.round(humidity)}%` : null,
    windSpeed !== null ? `Wind ${Math.round(windSpeed)} km/h` : null,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" · ");

  return {
    score,
    severity,
    detail,
  };
};

export const buildHighestRiskSavedCity = (
  records: SavedCitySummaryRecord[]
): HomeSavedCityIntelligence | null => {
  const ranked = records
    .map((record) => {
      if (!record.summary) {
        return null;
      }

      const risk = scoreSavedCityRisk(record.summary);
      return {
        city: record.city,
        ...risk,
      };
    })
    .filter((record): record is NonNullable<typeof record> => Boolean(record))
    .sort((left, right) => right.score - left.score);

  const highestRisk = ranked[0];
  if (!highestRisk) {
    return null;
  }

  if (highestRisk.severity === "high") {
    return {
      city: highestRisk.city,
      severity: highestRisk.severity,
      summaryEn: "This saved city is carrying the sharpest weather signal in your list.",
      summaryZh: "这座已收藏城市目前承载着最强的一档天气信号。",
      detail: highestRisk.detail || "Reopen this city first for the clearest weather handoff.",
    };
  }

  if (highestRisk.severity === "moderate") {
    return {
      city: highestRisk.city,
      severity: highestRisk.severity,
      summaryEn: "This saved city deserves the first re-check before you jump back into the workspace.",
      summaryZh: "回到工作台前，建议先重新确认这座城市的天气变化。",
      detail: highestRisk.detail || "A few mixed weather signals stand out on this saved city.",
    };
  }

  return {
    city: highestRisk.city,
    severity: highestRisk.severity,
    summaryEn: "Conditions look relatively calm, but this city still leads your saved-city watchlist.",
    summaryZh: "整体条件还算平稳，但它仍然是你收藏列表里最值得先看的城市。",
    detail: highestRisk.detail || "The current saved-city list is broadly stable.",
  };
};

export const buildHomeComparePreset = (cities: SavedCity[]): HomeComparePreset | null => {
  if (cities.length < 2) {
    return null;
  }

  const cityNames = cities.map((city) => city.city);

  return {
    label: cityNames.join(" · "),
    cityNames,
    compareQuery: cities.map((city) => getSavedCityLocationId(city)).join(","),
    descriptionEn:
      "Reopen the persisted compare lane directly from home without rebuilding the selection.",
    descriptionZh: "不用重新挑选城市，直接从首页恢复上一次的对比集合。",
  };
};
