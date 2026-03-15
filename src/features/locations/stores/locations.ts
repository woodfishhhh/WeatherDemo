import { isAxiosError } from "axios";
import { shallowRef } from "vue";
import { defineStore } from "pinia";
import type { LocationRecord, SavedCityWeatherSummary } from "@/features/weather/types";
import {
  getSavedCityWeatherSummary,
  lookupLocationByCoordinates,
  searchLocations,
} from "@/features/weather/services/qweather";
import {
  getSavedCitiesSnapshot,
  loadSavedCitiesWithSync,
  saveSavedCities,
  type SavedCitiesSyncStatus,
  type SavedCity,
} from "@/features/locations/services/persistence";
import {
  isSameSavedCity,
  matchesSavedCityLocation,
} from "@/features/locations/utils/locationKeys";

export type CurrentLocationWeather = {
  location: LocationRecord;
  weather: SavedCityWeatherSummary;
};

type SearchStatus = "idle" | "loading" | "ready" | "error";
type SyncStatus = "idle" | "syncing" | SavedCitiesSyncStatus;

export const useLocationsStore = defineStore("locations", () => {
  const savedCities = shallowRef<SavedCity[]>(getSavedCitiesSnapshot());
  const hasLoadedSavedCities = shallowRef(savedCities.value.length > 0);
  const syncStatus = shallowRef<SyncStatus>("idle");
  const syncErrorReason = shallowRef("");
  let savedCitiesMutationVersion = 0;

  const searchResults = shallowRef<LocationRecord[]>([]);
  const searchStatus = shallowRef<SearchStatus>("idle");
  const searchError = shallowRef("");

  const currentLocation = shallowRef<CurrentLocationWeather | null>(null);
  const currentLocationStatus = shallowRef<SearchStatus>("idle");
  const currentLocationError = shallowRef("");

  const loadSavedCities = async (force = false): Promise<SavedCity[]> => {
    if (hasLoadedSavedCities.value && !force) {
      return savedCities.value;
    }

    syncStatus.value = "syncing";
    syncErrorReason.value = "";
    const loadMutationVersion = savedCitiesMutationVersion;

    const applyLoadedCities = (nextCities: SavedCity[]): boolean => {
      if (savedCitiesMutationVersion !== loadMutationVersion) {
        return false;
      }

      savedCities.value = nextCities;
      hasLoadedSavedCities.value = true;
      return true;
    };

    const result = await loadSavedCitiesWithSync({
      onCloudUpdate: (nextCities) => {
        applyLoadedCities(nextCities);
      },
    });

    if (!applyLoadedCities(result.cities)) {
      return savedCities.value;
    }

    syncStatus.value = result.syncStatus;
    syncErrorReason.value = result.reason ?? "";
    return result.cities;
  };

  const persistSavedCities = async (cities: SavedCity[]): Promise<SavedCity[]> => {
    const mutationVersion = ++savedCitiesMutationVersion;
    syncErrorReason.value = "";
    savedCities.value = cities;
    hasLoadedSavedCities.value = true;

    const result = await saveSavedCities(cities);

    if (savedCitiesMutationVersion !== mutationVersion) {
      return savedCities.value;
    }

    savedCities.value = result.cities;
    hasLoadedSavedCities.value = true;
    syncStatus.value = result.syncStatus;
    syncErrorReason.value = result.reason ?? "";
    return result.cities;
  };

  const removeSavedCityById = async (id: string): Promise<SavedCity[]> =>
    persistSavedCities(savedCities.value.filter((city) => city.id !== id));

  const toggleSavedCity = async (city: SavedCity): Promise<SavedCity[]> => {
    const hasExistingMatch = savedCities.value.some((item) => isSameSavedCity(item, city));

    if (hasExistingMatch) {
      return persistSavedCities(savedCities.value.filter((item) => !isSameSavedCity(item, city)));
    }

    return persistSavedCities([...savedCities.value, city]);
  };

  const isLocationSaved = (location: LocationRecord | null): boolean => {
    if (!location) {
      return false;
    }

    return savedCities.value.some((city) => matchesSavedCityLocation(city, location));
  };

  const searchByKeyword = async (
    keyword: string,
    options: {
      signal?: AbortSignal;
    } = {}
  ): Promise<LocationRecord[]> => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      searchResults.value = [];
      searchError.value = "";
      searchStatus.value = "idle";
      return [];
    }

    searchStatus.value = "loading";
    searchError.value = "";

    try {
      const results = await searchLocations(normalizedKeyword, {
        signal: options.signal,
      });
      const lowerKeyword = normalizedKeyword.toLowerCase();

      searchResults.value = results
        .filter((location) => location.name.toLowerCase().includes(lowerKeyword))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(lowerKeyword);
          const bStarts = b.name.toLowerCase().startsWith(lowerKeyword);
          return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
        });
      searchStatus.value = "ready";
      return searchResults.value;
    } catch (error) {
      if (isAxiosError(error) && error.code === "ERR_CANCELED") {
        return searchResults.value;
      }

      searchResults.value = [];
      searchError.value = error instanceof Error ? error.message : "Search failed / 搜索失败";
      searchStatus.value = "error";
      return [];
    }
  };

  const clearSearch = (): void => {
    searchResults.value = [];
    searchError.value = "";
    searchStatus.value = "idle";
  };

  const requestCurrentLocation = async (): Promise<CurrentLocationWeather | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      currentLocationStatus.value = "error";
      currentLocationError.value = "Geolocation is not supported in this browser. / 当前浏览器不支持定位。";
      currentLocation.value = null;
      return null;
    }

    currentLocationStatus.value = "loading";
    currentLocationError.value = "";

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 300000,
        });
      });

      const location = await lookupLocationByCoordinates(
        position.coords.longitude,
        position.coords.latitude
      );

      if (!location) {
        currentLocation.value = null;
        currentLocationStatus.value = "error";
        currentLocationError.value =
          "Unable to match your coordinates to a QWeather city. / 无法将坐标匹配到和风天气城市。";
        return null;
      }

      const weather = await getSavedCityWeatherSummary(location);
      if (!weather) {
        currentLocation.value = null;
        currentLocationStatus.value = "error";
        currentLocationError.value =
          "Current location resolved, but weather data is unavailable right now. / 已解析当前位置，但暂时无法获取天气。";
        return null;
      }

      currentLocation.value = {
        location,
        weather,
      };
      currentLocationStatus.value = "ready";
      return currentLocation.value;
    } catch (error) {
      currentLocation.value = null;
      currentLocationStatus.value = "error";

      if (error instanceof GeolocationPositionError) {
        const messageMap: Record<number, string> = {
          [error.PERMISSION_DENIED]: "Location permission was denied. / 定位权限已被拒绝。",
          [error.POSITION_UNAVAILABLE]: "Your location could not be determined. / 无法确定当前位置。",
          [error.TIMEOUT]: "Location request timed out. / 定位请求超时。",
        };

        currentLocationError.value =
          messageMap[error.code] ?? "Location request failed. / 定位请求失败。";
      } else {
        currentLocationError.value =
          error instanceof Error ? error.message : "Location request failed. / 定位请求失败。";
      }

      return null;
    }
  };

  return {
    savedCities,
    hasLoadedSavedCities,
    syncStatus,
    syncErrorReason,
    searchResults,
    searchStatus,
    searchError,
    currentLocation,
    currentLocationStatus,
    currentLocationError,
    loadSavedCities,
    persistSavedCities,
    removeSavedCityById,
    toggleSavedCity,
    isLocationSaved,
    searchByKeyword,
    clearSearch,
    requestCurrentLocation,
  };
});
