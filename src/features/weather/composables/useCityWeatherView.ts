import { computed, onMounted, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { buildComfortMetrics } from "@/features/air-quality/utils/comfortMetrics";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { toSavedCityRecord } from "@/features/locations/utils/locationKeys";
import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
import { useSettingsStore } from "@/features/settings/stores/settings";
import { getHistoricalTrends } from "@/features/weather/services/qweather";
import { useWeatherStore } from "@/features/weather/stores/weather";
import type { HistoricalTrendState } from "@/features/weather/types";
import { useWorkspaceStore, type WorkspaceGroup } from "@/features/workspace/stores/workspace";

const normalizeWorkspaceGroup = (value: unknown): WorkspaceGroup | undefined =>
  value === "all" || value === "favorites" || value === "recent" ? value : undefined;

const compareQueryKey = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value.join(",");
  }

  return typeof value === "string" ? value : undefined;
};

const parseCompareQuery = (value: unknown): string[] => {
  const raw = compareQueryKey(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, items) => Boolean(item) && items.indexOf(item) === index)
    .slice(0, 4);
};

export const useCityWeatherView = () => {
  const route = useRoute();
  const router = useRouter();
  const locationsStore = useLocationsStore();
  const settingsStore = useSettingsStore();
  const weatherStore = useWeatherStore();
  const workspaceStore = useWorkspaceStore();
  const { formatDateTime: formatDateTimeWithPolicy, formatTemperature, formatWind } = useWeatherDisplayPreferences();

  workspaceStore.hydrate();

  const { savedCities } = storeToRefs(locationsStore);
  const { activeCityError, activeCityStatus, activeCityWeather, activeLocation } = storeToRefs(weatherStore);
  const { reducedMotion } = storeToRefs(settingsStore);
  const { compareLocationIds } = storeToRefs(workspaceStore);
  const historicalTrends = shallowRef<HistoricalTrendState>({
    status: "unavailable",
    data: null,
    reason: "Historical trends are not loaded yet.",
  });
  let activeLoadRequestId = 0;

  const loadWeather = async () => {
    const requestId = ++activeLoadRequestId;
    const bundle = await weatherStore.loadCityWeather({
      id: typeof route.query.qid === "string" ? route.query.qid : undefined,
      city: typeof route.params.city === "string" ? route.params.city : undefined,
      province: typeof route.params.province === "string" ? route.params.province : undefined,
    });

    if (requestId !== activeLoadRequestId) {
      return;
    }

    if (bundle?.location.id) {
      workspaceStore.rememberRecentLocation(bundle.location.id);
      try {
        const nextHistoricalTrends = await getHistoricalTrends(bundle.location);
        if (requestId !== activeLoadRequestId) {
          return;
        }

        historicalTrends.value = nextHistoricalTrends;
      } catch (error) {
        if (requestId !== activeLoadRequestId) {
          return;
        }

        historicalTrends.value = {
          status: "unavailable",
          data: null,
          reason:
            error instanceof Error
              ? error.message
              : "Historical trends are unavailable for this city.",
        };
      }

      return;
    }

    historicalTrends.value = {
      status: "unavailable",
      data: null,
      reason: "Historical trends are unavailable for this city.",
    };
  };

  const retryLoadWeather = (): void => {
    void loadWeather();
  };

  const toggleSaveCity = async () => {
    if (!activeLocation.value) {
      return;
    }

    const existingId = typeof route.query.id === "string" ? route.query.id : undefined;
    const nextCities = await locationsStore.toggleSavedCity(toSavedCityRecord(activeLocation.value, existingId));
    const nextSavedCity = nextCities.find((city) => (city.locationId || city.id) === activeLocation.value?.id);

    void router.replace({
      query: {
        ...route.query,
        id: nextSavedCity?.id,
        qid: activeLocation.value.id,
        lat: activeLocation.value.latitude,
        lon: activeLocation.value.longitude,
      },
    });
  };

  const isSaved = computed(() => locationsStore.isLocationSaved(activeLocation.value));
  const compareCount = computed(() => {
    const routeCompareCount = parseCompareQuery(route.query.compare).length;
    return routeCompareCount || compareLocationIds.value.length;
  });
  const workspaceGroup = computed<WorkspaceGroup>(() => normalizeWorkspaceGroup(route.query.group) ?? "recent");
  const workspaceCompareQuery = computed(() => {
    const routeCompare = compareQueryKey(route.query.compare);
    if (routeCompare) {
      return routeCompare;
    }

    return compareLocationIds.value.length ? compareLocationIds.value.join(",") : undefined;
  });
  const canOpenWorkspace = computed(() => isSaved.value);
  const workspaceContinuation = computed(() => {
    if (!isSaved.value) {
      return {
        label: "Save To Continue / 收藏后继续",
        description:
          "Save this city first and the workspace recent lane will be able to reopen it. / 先收藏此城市，工作台最近分组才能继续承接。",
      };
    }

    if (compareCount.value) {
      return {
        label: "Continue In Workspace / 在工作台继续",
        description:
          "The active compare set will travel with you into the workspace route. / 当前对比集合会一并带到工作台。",
      };
    }

    return {
      label: "Continue In Workspace / 在工作台继续",
      description:
        "This saved city will open inside the workspace recent lane for the next step. / 这座已收藏城市会在工作台最近分组中继续承接。",
    };
  });

  const openWorkspace = async (): Promise<void> => {
    if (!canOpenWorkspace.value) {
      return;
    }

    await router.push({
      name: "workspace",
      query: {
        group: workspaceGroup.value,
        compare: workspaceCompareQuery.value,
      },
    });
  };

  const resolveLocationTimezone = (): string | undefined =>
    activeCityWeather.value?.location.timezone ?? activeLocation.value?.timezone;

  const formatHour = (value: string) =>
    formatDateTimeWithPolicy(
      value,
      {
        hour: "2-digit",
        minute: "2-digit",
      },
      resolveLocationTimezone()
    );

  const formatDay = (value: string) =>
    formatDateTimeWithPolicy(
      value,
      {
        month: "long",
        day: "numeric",
        weekday: "short",
      },
      resolveLocationTimezone()
    );

  const formatDateTime = (value: string) =>
    formatDateTimeWithPolicy(
      value,
      {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
      resolveLocationTimezone()
    );

  const prefersReducedMotion = computed(() => {
    if (reducedMotion.value !== null) {
      return reducedMotion.value;
    }

    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

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
    comfortMetrics: computed(() => buildComfortMetrics(activeCityWeather.value)),
    route,
    savedCities,
    weatherData: activeCityWeather,
    historicalTrends,
    resolvedLocation: activeLocation,
    errorMessage: activeCityError,
    isLoading: computed(() => activeCityStatus.value === "loading"),
    isSaved,
    prefersReducedMotion,
    retryLoadWeather,
    formatTemperature,
    formatWind,
    canOpenWorkspace,
    toggleSaveCity,
    openWorkspace,
    workspaceContinuation,
    formatHour,
    formatDay,
    formatDateTime,
  };
};
