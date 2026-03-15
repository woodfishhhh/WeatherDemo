import { isAxiosError } from "axios";
import type {
  AirQualityState,
  CityWeatherBundle,
  CurrentConditions,
  DailyForecastPoint,
  HistoricalTrendState,
  HourlyForecastPoint,
  LocationRecord,
  SavedCityWeatherSummary,
} from "@/features/weather/types";
import {
  QWeatherAdapterError,
  fetchAirQualityResponse,
  fetchCoordinateLookupResponse,
  fetchCurrentWeatherResponse,
  fetchDailyForecastResponse,
  fetchHistoricalWeatherResponse,
  fetchHourlyForecastResponse,
  fetchLocationSearchResponse,
  isAuthorizationLikeError,
  toQWeatherError,
  unwrapResponse,
  type CachedQWeatherDataset,
} from "./qweather.transport";
import {
  normalizeAirQuality,
  normalizeCurrent,
  normalizeDaily,
  normalizeHistoricalTrendPoint,
  normalizeHourly,
  normalizeLocation,
} from "./qweather.mappers";

const AIR_QUALITY_CAPABILITY_KEY = "qweather_air_quality_capability";
const DATASET_TTL_MS: Record<CachedQWeatherDataset, number> = {
  current: 10 * 60 * 1000,
  hourly: 30 * 60 * 1000,
  daily: 60 * 60 * 1000,
  "air-quality": 60 * 60 * 1000,
  "historical-trends": 24 * 60 * 60 * 1000,
};

let airQualityCapability: "unknown" | "available" | "unauthorized" = "unknown";
const datasetResponseCache = new Map<string, { expiresAt: number; value: unknown }>();
const datasetInflightRequests = new Map<string, Promise<unknown>>();

const readAirQualityCapability = (): typeof airQualityCapability => {
  if (typeof window === "undefined") {
    return airQualityCapability;
  }

  const saved = window.sessionStorage.getItem(AIR_QUALITY_CAPABILITY_KEY);
  if (saved === "available" || saved === "unauthorized") {
    airQualityCapability = saved;
  }

  return airQualityCapability;
};

const writeAirQualityCapability = (value: typeof airQualityCapability): void => {
  airQualityCapability = value;

  if (typeof window === "undefined" || value === "unknown") {
    return;
  }

  window.sessionStorage.setItem(AIR_QUALITY_CAPABILITY_KEY, value);
};

const buildDatasetCacheKey = (dataset: CachedQWeatherDataset, parts: Array<string | number>): string =>
  dataset + ":" + parts.join("|");

const readCachedDatasetValue = <T>(key: string): T | null => {
  const cached = datasetResponseCache.get(key);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    datasetResponseCache.delete(key);
    return null;
  }

  return cached.value as T;
};

const shouldPersistDatasetValue = <T>(dataset: CachedQWeatherDataset, value: T): boolean => {
  if (dataset === "air-quality" || dataset === "historical-trends") {
    return !(
      value &&
      typeof value === "object" &&
      "status" in (value as Record<string, unknown>) &&
      (value as Record<string, unknown>).status !== "available"
    );
  }

  return true;
};

const withDatasetCache = async <T>(
  dataset: CachedQWeatherDataset,
  keyParts: Array<string | number>,
  loader: () => Promise<T>
): Promise<T> => {
  const key = buildDatasetCacheKey(dataset, keyParts);
  const cached = readCachedDatasetValue<T>(key);
  if (cached !== null) {
    return cached;
  }

  const inflight = datasetInflightRequests.get(key);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const request = loader()
    .then((value) => {
      if (shouldPersistDatasetValue(dataset, value)) {
        datasetResponseCache.set(key, {
          expiresAt: Date.now() + DATASET_TTL_MS[dataset],
          value,
        });
      }

      return value;
    })
    .finally(() => {
      datasetInflightRequests.delete(key);
    });

  datasetInflightRequests.set(key, request);
  return request;
};

export const __resetQWeatherRequestCache = (): void => {
  datasetResponseCache.clear();
  datasetInflightRequests.clear();
  airQualityCapability = "unknown";

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(AIR_QUALITY_CAPABILITY_KEY);
  }
};

const toUtcDateKey = (date: Date): string =>
  String(date.getUTCFullYear()) +
  String(date.getUTCMonth() + 1).padStart(2, "0") +
  String(date.getUTCDate()).padStart(2, "0");

const buildHistoricalDateRange = (days = 5, endDate = new Date()): string[] => {
  const totalDays = Math.min(Math.max(days, 1), 10);
  const anchor = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

  return Array.from({ length: totalDays }, (_, index) => {
    const nextDate = new Date(anchor);
    nextDate.setUTCDate(anchor.getUTCDate() - (totalDays - index));
    return toUtcDateKey(nextDate);
  });
};

export const searchLocations = async (
  keyword: string,
  options: {
    signal?: AbortSignal;
  } = {}
): Promise<LocationRecord[]> => {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    return [];
  }

  try {
    const response = unwrapResponse(
      await fetchLocationSearchResponse(normalizedKeyword, options.signal),
      "location",
      "QWeather location search failed."
    );

    return (response.location ?? [])
      .map(normalizeLocation)
      .filter((item): item is LocationRecord => item !== null);
  } catch (error) {
    throw toQWeatherError(error, "location", "QWeather location search failed.");
  }
};

export const lookupLocationByCoordinates = async (
  longitude: number | string,
  latitude: number | string
): Promise<LocationRecord | null> => {
  try {
    const response = unwrapResponse(
      await fetchCoordinateLookupResponse(longitude, latitude),
      "location",
      "QWeather coordinate lookup failed."
    );
    const firstLocation = (response.location ?? [])
      .map(normalizeLocation)
      .find((item): item is LocationRecord => item !== null);

    return firstLocation ?? null;
  } catch (error) {
    throw toQWeatherError(error, "location", "QWeather coordinate lookup failed.");
  }
};

export const resolveLocation = async ({
  id,
  city,
  province,
}: {
  id?: string;
  city?: string;
  province?: string;
}): Promise<LocationRecord | null> => {
  if (id) {
    const byId = await searchLocations(id);
    const exactId = byId.find((item) => item.id === id);
    if (exactId) {
      return exactId;
    }
  }

  if (!city) {
    return null;
  }

  const candidates = await searchLocations(province ? city + " " + province : city);
  const exact =
    candidates.find((item) => item.name === city && (!province || item.province === province)) ?? candidates[0];

  return exact ?? null;
};

const getLocationQuery = (location: Pick<LocationRecord, "id" | "latitude" | "longitude">): string =>
  location.id || location.longitude + "," + location.latitude;

export const getCurrentWeather = async (location: LocationRecord): Promise<CurrentConditions | null> => {
  return withDatasetCache("current", [getLocationQuery(location)], async () => {
    try {
      const response = unwrapResponse(
        await fetchCurrentWeatherResponse(getLocationQuery(location)),
        "current",
        "QWeather current weather request failed."
      );
      return normalizeCurrent(response.now);
    } catch (error) {
      throw toQWeatherError(error, "current", "QWeather current weather request failed.");
    }
  });
};

export const getHourlyForecast = async (location: LocationRecord): Promise<HourlyForecastPoint[]> => {
  return withDatasetCache("hourly", [getLocationQuery(location)], async () => {
    try {
      const response = unwrapResponse(
        await fetchHourlyForecastResponse(getLocationQuery(location)),
        "hourly",
        "QWeather hourly forecast request failed."
      );
      return normalizeHourly(response.hourly).slice(0, 8);
    } catch (error) {
      throw toQWeatherError(error, "hourly", "QWeather hourly forecast request failed.");
    }
  });
};

export const getDailyForecast = async (location: LocationRecord): Promise<DailyForecastPoint[]> => {
  return withDatasetCache("daily", [getLocationQuery(location)], async () => {
    try {
      const response = unwrapResponse(
        await fetchDailyForecastResponse(getLocationQuery(location)),
        "daily",
        "QWeather daily forecast request failed."
      );
      return normalizeDaily(response.daily);
    } catch (error) {
      throw toQWeatherError(error, "daily", "QWeather daily forecast request failed.");
    }
  });
};

export const getAirQuality = async (location: LocationRecord): Promise<AirQualityState> => {
  return withDatasetCache("air-quality", [getLocationQuery(location)], async () => {
    if (readAirQualityCapability() === "unauthorized") {
      return {
        status: "unavailable",
        data: null,
        reason: "Air quality is unavailable with the current QWeather access. / 当前和风天气权限暂不包含空气质量数据。",
      };
    }

    try {
      const response = unwrapResponse(
        await fetchAirQualityResponse(getLocationQuery(location)),
        "air-quality",
        "QWeather air quality request failed."
      );

      writeAirQualityCapability("available");
      return {
        status: "available",
        data: normalizeAirQuality(response.now),
      };
    } catch (error) {
      if (isAuthorizationLikeError(error)) {
        writeAirQualityCapability("unauthorized");
        return {
          status: "unavailable",
          data: null,
          reason: "Air quality is unavailable for the current QWeather plan or host permissions. / 当前和风天气套餐或主机权限暂不支持空气质量。",
        };
      }

      if (error instanceof QWeatherAdapterError && error.code === "invalid-payload") {
        return {
          status: "unavailable",
          data: null,
          reason: error.message,
        };
      }

      return {
        status: "unavailable",
        data: null,
        reason: "Air quality data is temporarily unavailable. / 空气质量数据暂时不可用。",
      };
    }
  });
};

export const getHistoricalTrends = async (
  location: LocationRecord,
  options: {
    days?: number;
    endDate?: Date;
  } = {}
): Promise<HistoricalTrendState> => {
  const dates = buildHistoricalDateRange(options.days, options.endDate);

  return withDatasetCache("historical-trends", [getLocationQuery(location), dates.join(",")], async () => {
    try {
      const responses = await Promise.all(
        dates.map((date) => fetchHistoricalWeatherResponse(getLocationQuery(location), date))
      );

      return {
        status: "available",
        data: responses.map((data, index) => {
          const response = unwrapResponse(data, "historical-trends", "QWeather historical weather request failed.");
          const dailyPayload = Array.isArray(response.weatherDaily) ? response.weatherDaily[0] : response.weatherDaily;

          return normalizeHistoricalTrendPoint(
            dailyPayload?.fxDate ?? dates[index] ?? toUtcDateKey(new Date()),
            dailyPayload,
            Array.isArray(response.weatherHourly) ? response.weatherHourly : []
          );
        }),
      };
    } catch (error) {
      if (error instanceof QWeatherAdapterError && error.code === "invalid-payload") {
        throw error;
      }

      if (isAxiosError(error) || error instanceof QWeatherAdapterError) {
        return {
          status: "unavailable",
          data: null,
          reason:
            error instanceof Error
              ? error.message
              : "Historical trend data is unavailable for the current QWeather configuration. / 当前和风天气配置暂不支持历史趋势数据。",
        };
      }

      return {
        status: "unavailable",
        data: null,
        reason: "Historical trend data is temporarily unavailable. / 历史趋势数据暂时不可用。",
      };
    }
  });
};

export const getCityWeatherBundle = async (location: LocationRecord): Promise<CityWeatherBundle> => {
  const [current, hourly, daily, airQuality] = await Promise.all([
    getCurrentWeather(location),
    getHourlyForecast(location),
    getDailyForecast(location),
    getAirQuality(location),
  ]);

  return {
    location,
    current,
    hourly,
    daily,
    airQuality,
  };
};

export const getSavedCityWeatherSummary = async (
  location: LocationRecord
): Promise<SavedCityWeatherSummary | null> => {
  const [current, daily] = await Promise.all([
    getCurrentWeather(location),
    getDailyForecast(location),
  ]);
  if (!current) {
    return null;
  }

  return {
    temperature: current.temperature,
    text: current.text,
    textBilingual: current.textBilingual,
    icon: current.icon,
    humidity: current.humidity,
    windScale: current.windScale,
    windSpeed: current.windSpeed,
    precipitation: daily[0]?.precip ?? "--",
    province: location.province,
  };
};
