import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { toSavedCityRecord } from "@/features/locations/utils/locationKeys";
import { useWeatherStore } from "@/features/weather/stores/weather";
import { useWorkspaceStore } from "@/features/workspace/stores/workspace";

export const useCityWeatherView = () => {
  const route = useRoute();
  const router = useRouter();
  const locationsStore = useLocationsStore();
  const weatherStore = useWeatherStore();
  const workspaceStore = useWorkspaceStore();

  const { savedCities } = storeToRefs(locationsStore);
  const { activeCityError, activeCityStatus, activeCityWeather, activeLocation } = storeToRefs(weatherStore);

  const loadWeather = async () => {
    const bundle = await weatherStore.loadCityWeather({
      id: typeof route.query.qid === "string" ? route.query.qid : undefined,
      city: typeof route.params.city === "string" ? route.params.city : undefined,
      province: typeof route.params.province === "string" ? route.params.province : undefined,
    });

    if (bundle?.location.id) {
      workspaceStore.rememberRecentLocation(bundle.location.id);
    }
  };

  const toggleSaveCity = async () => {
    if (!activeLocation.value) {
      return;
    }

    const existingId = typeof route.query.id === "string" ? route.query.id : undefined;
    await locationsStore.toggleSavedCity(toSavedCityRecord(activeLocation.value, existingId));

    void router.replace({
      query: {
        ...route.query,
        qid: activeLocation.value.id,
        lat: activeLocation.value.latitude,
        lon: activeLocation.value.longitude,
      },
    });
  };

  const isSaved = computed(() => locationsStore.isLocationSaved(activeLocation.value));

  const formatHour = (value: string) =>
    new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const formatDay = (value: string) =>
    new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(new Date(value));

  const formatDateTime = (value: string) =>
    value
      ? new Intl.DateTimeFormat("zh-CN", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(value))
      : "--";

  onMounted(() => {
    window.scrollTo(0, 0);
    void locationsStore.loadSavedCities();
  });

  watch(
    () => [route.params.province, route.params.city, route.query.qid],
    () => {
      void loadWeather();
    },
    { immediate: true }
  );

  return {
    route,
    savedCities,
    weatherData: activeCityWeather,
    resolvedLocation: activeLocation,
    errorMessage: activeCityError,
    isLoading: computed(() => activeCityStatus.value === "loading"),
    isSaved,
    toggleSaveCity,
    formatHour,
    formatDay,
    formatDateTime,
  };
};
