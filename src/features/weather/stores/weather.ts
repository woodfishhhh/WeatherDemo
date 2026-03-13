import { shallowRef } from "vue";
import { defineStore } from "pinia";
import type { CityWeatherBundle, LocationRecord, SavedCityWeatherSummary } from "@/features/weather/types";
import {
  getCityWeatherBundle,
  getSavedCityWeatherSummary,
  resolveLocation,
} from "@/features/weather/services/qweather";
import type { SavedCity } from "@/services/savedCities";
import { getSavedCityKey } from "@/features/locations/utils/locationKeys";

type RequestStatus = "idle" | "loading" | "ready" | "error";

export const useWeatherStore = defineStore("weather", () => {
  const activeLocation = shallowRef<LocationRecord | null>(null);
  const activeCityWeather = shallowRef<CityWeatherBundle | null>(null);
  const activeCityStatus = shallowRef<RequestStatus>("idle");
  const activeCityError = shallowRef("");
  const savedCitySummaries = shallowRef<Record<string, SavedCityWeatherSummary | null>>({});

  const loadCityWeather = async ({
    id,
    city,
    province,
  }: {
    id?: string;
    city?: string;
    province?: string;
  }): Promise<CityWeatherBundle | null> => {
    activeCityStatus.value = "loading";
    activeCityError.value = "";

    try {
      const location = await resolveLocation({ id, city, province });
      activeLocation.value = location;

      if (!location) {
        activeCityWeather.value = null;
        activeCityStatus.value = "error";
        activeCityError.value = "Unable to resolve this location in QWeather. / 无法在和风天气中解析该城市。";
        return null;
      }

      const bundle = await getCityWeatherBundle(location);
      activeCityWeather.value = bundle;
      activeCityStatus.value = "ready";
      return bundle;
    } catch (error) {
      activeCityWeather.value = null;
      activeCityStatus.value = "error";
      activeCityError.value =
        error instanceof Error ? error.message : "Failed to load weather data. / 加载天气失败。";
      return null;
    }
  };

  const hydrateSavedCitySummaries = async (cities: SavedCity[]): Promise<Record<string, SavedCityWeatherSummary | null>> => {
    if (!cities.length) {
      savedCitySummaries.value = {};
      return savedCitySummaries.value;
    }

    const summaryEntries = await Promise.all(
      cities.map(async (city) => {
        try {
          const location =
            city.locationId && city.latitude && city.longitude
              ? {
                  id: city.locationId,
                  name: city.city,
                  province: city.province,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  timezone: city.timezone,
                  country: city.country,
                  adcode: city.adcode,
                }
              : await resolveLocation({
                  id: city.locationId,
                  city: city.city,
                  province: city.province,
                });

          if (!location) {
            return [getSavedCityKey(city), null] as const;
          }

          const summary = await getSavedCityWeatherSummary(location);
          return [getSavedCityKey(city), summary] as const;
        } catch {
          return [getSavedCityKey(city), null] as const;
        }
      })
    );

    savedCitySummaries.value = Object.fromEntries(summaryEntries);
    return savedCitySummaries.value;
  };

  const getSavedCitySummary = (city: SavedCity): SavedCityWeatherSummary | null =>
    savedCitySummaries.value[getSavedCityKey(city)] ?? null;

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
