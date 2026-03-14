import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { SavedCity } from "@/features/locations/services/persistence";
import type { LocationRecord } from "@/features/weather/types";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
import { useWorkspaceStore } from "@/features/workspace/stores/workspace";

export const useHomeLocationSearch = () => {
  const router = useRouter();
  const locationsStore = useLocationsStore();
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

  const openLocation = (location: LocationRecord) => {
    workspaceStore.rememberRecentLocation(location.id);
    void router.push({
      name: "cityview",
      params: {
        province: location.province || location.name,
        city: location.name,
      },
      query: {
        qid: location.id,
        lat: location.latitude,
        lon: location.longitude,
      },
    });
  };

  const selectTip = (location: LocationRecord) => {
    openLocation(location);
    searchQuery.value = location.name;
    showTips.value = false;
  };

  const openSavedCity = (city: SavedCity) => {
    workspaceStore.rememberRecentLocation(city.locationId || city.id);
    void router.push({
      name: "cityview",
      params: {
        province: city.province,
        city: city.city,
      },
      query: {
        id: city.id,
        qid: city.locationId,
        lat: city.latitude,
        lon: city.longitude,
      },
    });
  };

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

  const compareQueryIds = computed(() => {
    const explicitCompareIds = compareLocationIds.value.filter((locationId) =>
      savedCities.value.some((city) => (city.locationId || city.id) === locationId)
    );

    return explicitCompareIds.length
      ? explicitCompareIds
      : savedCities.value.slice(0, 2).map((city) => city.locationId || city.id);
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
        compare: compareQueryIds.value.join(","),
      },
    });
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
      openLocation(currentLocation.value.location);
    }
  };

  onMounted(() => {
    workspaceStore.hydrate();
    void locationsStore.loadSavedCities();
  });

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
    openCurrentLocation,
    openSavedCity,
    openWorkspace,
    recentLocations,
    requestCurrentLocation: locationsStore.requestCurrentLocation,
    searchQuery,
    searchResults,
    savedCities,
    selectTip,
    selectFirstTip,
    showTips,
    workspaceShortcutSummary,
  };
};
