import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { LocationRecord } from "@/features/weather/types";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { useWorkspaceStore } from "@/features/workspace/stores/workspace";

export const useHomeLocationSearch = () => {
  const router = useRouter();
  const locationsStore = useLocationsStore();
  const workspaceStore = useWorkspaceStore();
  const { currentLocation, currentLocationError, currentLocationStatus, searchError, searchResults, searchStatus } =
    storeToRefs(locationsStore);

  const searchQuery = shallowRef("");
  const showTips = shallowRef(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let blurTimer: ReturnType<typeof setTimeout> | null = null;

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
    void locationsStore.loadSavedCities();
  });

  watch(searchQuery, (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const keyword = value.trim();
    if (!keyword) {
      locationsStore.clearSearch();
      showTips.value = false;
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await locationsStore.searchByKeyword(keyword);
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
  });

  return {
    searchQuery,
    showTips,
    searchResults,
    currentLocation,
    errorMessage: searchError,
    isLoading: computed(() => searchStatus.value === "loading"),
    isSearching: computed(() => searchStatus.value === "loading"),
    isLocating: computed(() => currentLocationStatus.value === "loading"),
    locationErrorMessage: currentLocationError,
    requestCurrentLocation: locationsStore.requestCurrentLocation,
    selectTip,
    selectFirstTip,
    onInputFocus,
    onInputBlur,
    openCurrentLocation,
  };
};
