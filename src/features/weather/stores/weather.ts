import { shallowRef } from "vue";
import { defineStore } from "pinia";
import type { CityWeatherBundle, LocationRecord, SavedCityWeatherSummary } from "@/features/weather/types";
import {
  getCityWeatherBundle,
  getSavedCityWeatherSummary,
  resolveLocation,
} from "@/features/weather/services/qweather";
import type { SavedCity } from "@/features/locations/services/persistence";
import { getSavedCityKey } from "@/features/locations/utils/locationKeys";
import { resolveSavedCityLocation } from "@/features/weather/utils/savedCityLocation";

type RequestStatus = "idle" | "loading" | "ready" | "error";
const SAVED_CITY_SUMMARY_TTL_MS = 10 * 60 * 1000;
type SavedCitySummaryLoadResult = {
  key: string;
  summary: SavedCityWeatherSummary | null;
  cacheable: boolean;
};

export const useWeatherStore = defineStore("weather", () => {
  const activeLocation = shallowRef<LocationRecord | null>(null);
  const activeCityWeather = shallowRef<CityWeatherBundle | null>(null);
  const activeCityStatus = shallowRef<RequestStatus>("idle");
  const activeCityError = shallowRef("");
  const savedCitySummaries = shallowRef<Record<string, SavedCityWeatherSummary | null>>({});
  const savedCitySummaryFetchedAt = shallowRef<Record<string, number>>({});
  const pendingSummaryRequests = new Map<string, Promise<SavedCitySummaryLoadResult>>();
  let activeCityRequestId = 0;
  let activeSavedCityHydrationRequestId = 0;

  const isSavedCitySummaryFresh = (key: string): boolean => {
    const fetchedAt = savedCitySummaryFetchedAt.value[key];
    return typeof fetchedAt === "number" && Date.now() - fetchedAt < SAVED_CITY_SUMMARY_TTL_MS;
  };

  const loadCityWeather = async ({
    id,
    city,
    province,
  }: {
    id?: string;
    city?: string;
    province?: string;
  }): Promise<CityWeatherBundle | null> => {
    const requestId = ++activeCityRequestId;
    activeCityStatus.value = "loading";
    activeCityError.value = "";

    try {
      const location = await resolveLocation({ id, city, province });
      if (requestId !== activeCityRequestId) {
        return activeCityWeather.value;
      }

      activeLocation.value = location;

      if (!location) {
        activeCityWeather.value = null;
        activeCityStatus.value = "error";
        activeCityError.value = "Unable to resolve this location in QWeather. / 无法在和风天气中解析该城市。";
        return null;
      }

      const bundle = await getCityWeatherBundle(location);
      if (requestId !== activeCityRequestId) {
        return activeCityWeather.value;
      }

      activeCityWeather.value = bundle;
      activeCityStatus.value = "ready";
      return bundle;
    } catch (error) {
      if (requestId !== activeCityRequestId) {
        return activeCityWeather.value;
      }

      activeCityWeather.value = null;
      activeCityStatus.value = "error";
      activeCityError.value =
        error instanceof Error ? error.message : "Failed to load weather data. / 加载天气失败。";
      return null;
    }
  };

  const loadSavedCitySummary = async (
    city: SavedCity
  ): Promise<SavedCitySummaryLoadResult> => {
    const summaryKey = getSavedCityKey(city);
    const pending = pendingSummaryRequests.get(summaryKey);
    if (pending) {
      return pending;
    }

    const request = (async (): Promise<SavedCitySummaryLoadResult> => {
      try {
        const location = await resolveSavedCityLocation(city);
        if (!location) {
          return {
            key: summaryKey,
            summary: null,
            cacheable: true,
          };
        }

        const summary = await getSavedCityWeatherSummary(location);
        return {
          key: summaryKey,
          summary,
          cacheable: summary !== null,
        };
      } catch {
        return {
          key: summaryKey,
          summary: null,
          cacheable: false,
        };
      } finally {
        pendingSummaryRequests.delete(summaryKey);
      }
    })();

    pendingSummaryRequests.set(summaryKey, request);
    return request;
  };

  const hydrateSavedCitySummaries = async (
    cities: SavedCity[],
    options: {
      force?: boolean;
    } = {}
  ): Promise<Record<string, SavedCityWeatherSummary | null>> => {
    const requestId = ++activeSavedCityHydrationRequestId;

    if (!cities.length) {
      savedCitySummaries.value = {};
      savedCitySummaryFetchedAt.value = {};
      return savedCitySummaries.value;
    }

    const nextKeys = new Set(cities.map((city) => getSavedCityKey(city)));
    savedCitySummaries.value = Object.fromEntries(
      Object.entries(savedCitySummaries.value).filter(([key]) => nextKeys.has(key))
    );
    savedCitySummaryFetchedAt.value = Object.fromEntries(
      Object.entries(savedCitySummaryFetchedAt.value).filter(([key]) => nextKeys.has(key))
    );

    const citiesNeedingRefresh = cities.filter((city) => {
      const key = getSavedCityKey(city);
      return (
        options.force ||
        !Object.prototype.hasOwnProperty.call(savedCitySummaries.value, key) ||
        !isSavedCitySummaryFresh(key)
      );
    });

    if (!citiesNeedingRefresh.length) {
      return savedCitySummaries.value;
    }

    const summaryEntries = await Promise.all(citiesNeedingRefresh.map((city) => loadSavedCitySummary(city)));
    if (requestId !== activeSavedCityHydrationRequestId) {
      return savedCitySummaries.value;
    }

    const fetchedAt = Date.now();
    const nextSummaries = { ...savedCitySummaries.value };
    const nextFetchedAt = { ...savedCitySummaryFetchedAt.value };

    for (const { key, summary, cacheable } of summaryEntries) {
      if (!nextKeys.has(key)) {
        continue;
      }

      nextSummaries[key] = summary;

      if (cacheable) {
        nextFetchedAt[key] = fetchedAt;
      } else {
        delete nextFetchedAt[key];
      }
    }

    savedCitySummaries.value = nextSummaries;
    savedCitySummaryFetchedAt.value = nextFetchedAt;
    return savedCitySummaries.value;
  };

  const getSavedCitySummary = (city: SavedCity): SavedCityWeatherSummary | null | undefined =>
    savedCitySummaries.value[getSavedCityKey(city)];

  return {
    activeLocation,
    activeCityWeather,
    activeCityStatus,
    activeCityError,
    savedCitySummaries,
    loadCityWeather,
    hydrateSavedCitySummaries,
    getSavedCitySummary,
  };
});
