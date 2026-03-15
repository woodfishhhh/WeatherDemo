import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { HomeComparePreset, HomeSavedCityIntelligence } from "@/features/home/utils/homeWorkspaceIntelligence";
import {
  buildHighestRiskSavedCity,
  buildHomeComparePreset,
} from "@/features/home/utils/homeWorkspaceIntelligence";
import type { SavedCity } from "@/features/locations/services/persistence";
import type { LocationRecord } from "@/features/weather/types";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
import { useWorkspaceStore } from "@/features/workspace/stores/workspace";
import { useWeatherStore } from "@/features/weather/stores/weather";

export const useHomeLocationSearch = () => {
  const router = useRouter();
  const locationsStore = useLocationsStore();
  const weatherStore = useWeatherStore();
  const workspaceStore = useWorkspaceStore();
  const { formatTemperature, formatWind } = useWeatherDisplayPreferences();
  const {
    currentLocation,
    currentLocationError,
    currentLocationStatus,
    savedCities,
    searchError,
    searchResults,
    searchStatus,
  } = storeToRefs(locationsStore);
  const { compareLocationIds, recentLocationIds } = storeToRefs(workspaceStore);

  const searchQuery = shallowRef("");
  const showTips = shallowRef(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let blurTimer: ReturnType<typeof setTimeout> | null = null;
  let activeSearchController: AbortController | null = null;
  let searchRequestId = 0;

  const recentLocations = computed(() =>
    recentLocationIds.value
      .map((locationId) => savedCities.value.find((city) => city.locationId === locationId || city.id === locationId))
      .filter((city): city is SavedCity => Boolean(city))
      .slice(0, 4)
  );

  const comparePreview = computed(() => {
    const explicitCompare = compareLocationIds.value
      .map((locationId) => savedCities.value.find((city) => (city.locationId || city.id) === locationId))
      .filter((city): city is SavedCity => Boolean(city));

    return explicitCompare.length ? explicitCompare.slice(0, 2) : savedCities.value.slice(0, 2);
  });

  const persistedCompareCities = computed(() =>
    compareLocationIds.value
      .map((locationId) => savedCities.value.find((city) => (city.locationId || city.id) === locationId))
      .filter((city): city is SavedCity => Boolean(city))
      .slice(0, 4)
  );

  const compareQueryIds = computed(() => {
    const explicitCompareIds = compareLocationIds.value.filter((locationId) =>
      savedCities.value.some((city) => (city.locationId || city.id) === locationId)
    );

    return explicitCompareIds.length
      ? explicitCompareIds
      : savedCities.value.slice(0, 2).map((city) => city.locationId || city.id);
  });
  const compareQueryValue = computed(() => compareQueryIds.value.join(",") || undefined);

  const comparePreset = computed<HomeComparePreset | null>(() =>
    buildHomeComparePreset(persistedCompareCities.value)
  );

  const savedCityIntelligence = computed<HomeSavedCityIntelligence | null>(() =>
    buildHighestRiskSavedCity(
      savedCities.value.map((city) => ({
        city,
        summary: weatherStore.getSavedCitySummary(city),
      }))
    )
  );

  const buildCityJourneyQuery = ({
    savedCityId,
    locationId,
    latitude,
    longitude,
    group,
  }: {
    savedCityId?: string;
    locationId?: string;
    latitude?: string;
    longitude?: string;
    group: "all" | "recent";
  }) => ({
    id: savedCityId,
    qid: locationId,
    lat: latitude,
    lon: longitude,
    group,
    compare: compareQueryValue.value,
  });

  const workspaceShortcutSummary = computed(() => ({
    savedCount: savedCities.value.length,
    recentCount: recentLocations.value.length,
    compareCount: comparePreview.value.length,
  }));

  const openWorkspace = async (group: "all" | "recent" = "all") => {
    await router.push({
      name: "workspace",
      query: {
        group,
        compare: compareQueryValue.value,
      },
    });
  };

  const openComparePreset = async (): Promise<void> => {
    if (!comparePreset.value) {
      return;
    }

    await router.push({
      name: "workspace",
      query: {
        group: "all",
        compare: comparePreset.value.compareQuery,
      },
    });
  };

  const openLocation = (location: LocationRecord, group: "all" | "recent" = "recent") => {
    const savedCity = savedCities.value.find((city) => (city.locationId || city.id) === location.id);

    workspaceStore.rememberRecentLocation(location.id);
    void router.push({
      name: "cityview",
      params: {
        province: location.province || location.name,
        city: location.name,
      },
      query: buildCityJourneyQuery({
        savedCityId: savedCity?.id,
        locationId: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        group,
      }),
    });
  };

  const selectTip = (location: LocationRecord) => {
    openLocation(location);
    searchQuery.value = location.name;
    showTips.value = false;
  };

  const openSavedCity = (city: SavedCity, group: "all" | "recent" = "all") => {
    const locationId = city.locationId || city.id;

    workspaceStore.rememberRecentLocation(locationId);
    void router.push({
      name: "cityview",
      params: {
        province: city.province,
        city: city.city,
      },
      query: buildCityJourneyQuery({
        savedCityId: city.id,
        locationId,
        latitude: city.latitude,
        longitude: city.longitude,
        group,
      }),
    });
  };

  const openRecentCity = (city: SavedCity) => {
    openSavedCity(city, "recent");
  };

  const openCompareCity = (city: SavedCity) => {
    openSavedCity(city, "all");
  };

  const selectFirstTip = () => {
    const firstTip = searchResults.value[0];
    if (firstTip) {
      selectTip(firstTip);
    }
  };

  const onInputFocus = () => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }

    if (searchResults.value.length) {
      showTips.value = true;
    }
  };

  const onInputBlur = () => {
    blurTimer = setTimeout(() => {
      showTips.value = false;
    }, 120);
  };

  const openCurrentLocation = () => {
    if (currentLocation.value) {
      openLocation(currentLocation.value.location, "recent");
    }
  };

  onMounted(() => {
    workspaceStore.hydrate();
    void locationsStore.loadSavedCities();
  });

  watch(
    savedCities,
    (cities) => {
      void weatherStore.hydrateSavedCitySummaries(cities);
    },
    { immediate: true }
  );

  watch(searchQuery, (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (activeSearchController) {
      activeSearchController.abort();
      activeSearchController = null;
    }

    const keyword = value.trim();
    if (!keyword) {
      searchRequestId += 1;
      locationsStore.clearSearch();
      showTips.value = false;
      return;
    }

    debounceTimer = setTimeout(async () => {
      const requestId = ++searchRequestId;
      const controller = new AbortController();
      activeSearchController = controller;
      const results = await locationsStore.searchByKeyword(keyword, {
        signal: controller.signal,
      });

      if (controller.signal.aborted || requestId !== searchRequestId) {
        return;
      }

      showTips.value = results.length > 0;
    }, 400);
  });

  onBeforeUnmount(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (blurTimer) {
      clearTimeout(blurTimer);
    }

    if (activeSearchController) {
      activeSearchController.abort();
      activeSearchController = null;
    }
  });

  return {
    comparePreset,
    comparePreview,
    currentLocation,
    errorMessage: searchError,
    formatTemperature,
    formatWind,
    isLoading: computed(() => searchStatus.value === "loading"),
    isLocating: computed(() => currentLocationStatus.value === "loading"),
    isSearching: computed(() => searchStatus.value === "loading"),
    locationErrorMessage: currentLocationError,
    onInputBlur,
    onInputFocus,
    openComparePreset,
    openCompareCity,
    openCurrentLocation,
    openRecentCity,
    openSavedCity,
    openWorkspace,
    recentLocations,
    requestCurrentLocation: locationsStore.requestCurrentLocation,
    searchQuery,
    searchResults,
    savedCityIntelligence,
    savedCities,
    selectTip,
    selectFirstTip,
    showTips,
    workspaceShortcutSummary,
  };
};
