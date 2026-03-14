import { computed, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import type { SavedCity } from "@/features/locations/services/persistence";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
import { useSettingsStore } from "@/features/settings/stores/settings";
import type { WorkspaceGroup } from "@/features/workspace/stores/workspace";
import { useWorkspaceStore, WORKSPACE_STORAGE_KEY } from "@/features/workspace/stores/workspace";
import { getHistoricalTrends } from "@/features/weather/services/qweather";
import { useWeatherStore } from "@/features/weather/stores/weather";
import type { HistoricalTrendState, SavedCityWeatherSummary } from "@/features/weather/types";
import { getSavedCityLocationId, resolveSavedCityLocation } from "@/features/weather/utils/savedCityLocation";

type WorkspaceTrendPanelState =
  | HistoricalTrendState
  | {
      status: "loading";
      data: null;
      reason: string;
    };

type WorkspaceCompareMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

type WorkspaceCityRecord = {
  city: SavedCity;
  locationId: string;
  summary: SavedCityWeatherSummary | null | undefined;
  isFavorite: boolean;
  isCompared: boolean;
  isRecent: boolean;
};

type WorkspaceCompareRecord = {
  city: SavedCity;
  locationId: string;
  summary: SavedCityWeatherSummary | null | undefined;
  trendState: WorkspaceTrendPanelState;
};

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

const parseNumber = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const normalized = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : null;
};

const cityByIdFrom = (cities: SavedCity[]): Map<string, SavedCity> =>
  new Map(cities.map((city) => [getSavedCityLocationId(city), city]));

const shouldUseDefaultCompare = (hasCompareIds: boolean, routeCompareValue: unknown): boolean => {
  if (hasCompareIds || compareQueryKey(routeCompareValue)) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  return !window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
};

export const useWorkspaceDashboard = () => {
  const route = useRoute();
  const router = useRouter();
  const locationsStore = useLocationsStore();
  const settingsStore = useSettingsStore();
  const weatherStore = useWeatherStore();
  const workspaceStore = useWorkspaceStore();
  const { formatTemperature, formatWind, temperatureUnit } = useWeatherDisplayPreferences();

  settingsStore.hydrate();
  workspaceStore.hydrate();

  const { savedCities, syncErrorReason, syncStatus } = storeToRefs(locationsStore);
  const { reducedMotion, workspaceDefaultGroup } = storeToRefs(settingsStore);
  const {
    compareLocationIds,
    favoriteLocationIds,
    recentLocationIds,
    selectedGroup,
  } = storeToRefs(workspaceStore);
  const trendStates = shallowRef<Record<string, WorkspaceTrendPanelState>>({});
  const shouldBackfillCompare = shallowRef(shouldUseDefaultCompare(compareLocationIds.value.length > 0, route.query.compare));
  let trendRequestId = 0;

  const prefersReducedMotion = computed(() => {
    if (reducedMotion.value !== null) {
      return reducedMotion.value;
    }

    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const cityById = computed(() => cityByIdFrom(savedCities.value));

  const resolveSavedCities = (locationIds: string[]): SavedCity[] =>
    locationIds
      .map((locationId) => cityById.value.get(locationId))
      .filter((city): city is SavedCity => Boolean(city));

  const groupedCities = computed<Record<WorkspaceGroup, SavedCity[]>>(() => ({
    all: savedCities.value,
    favorites: resolveSavedCities(favoriteLocationIds.value),
    recent: resolveSavedCities(recentLocationIds.value),
  }));

  const visibleCities = computed(() => groupedCities.value[selectedGroup.value]);

  const visibleCityRecords = computed<WorkspaceCityRecord[]>(() =>
    visibleCities.value.map((city) => {
      const locationId = getSavedCityLocationId(city);

      return {
        city,
        locationId,
        summary: weatherStore.getSavedCitySummary(city),
        isFavorite: workspaceStore.isFavoriteLocation(locationId),
        isCompared: workspaceStore.isCompareLocation(locationId),
        isRecent: recentLocationIds.value.includes(locationId),
      };
    })
  );

  const compareRecords = computed<WorkspaceCompareRecord[]>(() =>
    resolveSavedCities(compareLocationIds.value).map((city) => {
      const locationId = getSavedCityLocationId(city);

      return {
        city,
        locationId,
        summary: weatherStore.getSavedCitySummary(city),
        trendState:
          trendStates.value[locationId] ??
          ({
            status: "loading",
            data: null,
            reason: "Loading workspace trend data. / 正在加载工作台趋势数据。",
          } as WorkspaceTrendPanelState),
      };
    })
  );

  const compareTrendCities = computed(() =>
    resolveSavedCities(compareLocationIds.value)
      .slice(0, 2)
      .map((city) => ({
        city,
        locationId: getSavedCityLocationId(city),
      }))
  );

  const groupCounts = computed(() => ({
    all: groupedCities.value.all.length,
    favorites: groupedCities.value.favorites.length,
    recent: groupedCities.value.recent.length,
  }));

  const workspaceSummary = computed(() => ({
    savedCount: savedCities.value.length,
    favoriteCount: groupedCities.value.favorites.length,
    recentCount: groupedCities.value.recent.length,
    compareCount: compareRecords.value.length,
  }));

  const activeGroupCopy = computed(() => {
    if (selectedGroup.value === "favorites") {
      return {
        title: "Favorited monitoring lane / 关注城市",
        description:
          "Pinned cities stay in a quieter lane so your most important places remain visible without turning the page into a dense dashboard.",
      };
    }

    if (selectedGroup.value === "recent") {
      return {
        title: "Recently reopened cities / 最近查看",
        description:
          "Recent city entries are pulled forward from your latest route visits, keeping the handoff between detail pages and the workspace lightweight.",
      };
    }

    return {
      title: "All saved cities / 全部收藏城市",
      description:
        "The workspace stays list-led and spacious, using grouped cards and compare summaries instead of duplicating the city-detail layout.",
    };
  });

  const compareMetrics = computed<WorkspaceCompareMetric[]>(() => {
    if (!compareRecords.value.length) {
      return [];
    }

    const recordsWithSummary = compareRecords.value.filter((record) => record.summary);
    const warmestRecord = recordsWithSummary
      .filter((record) => parseNumber(record.summary?.temperature) !== null)
      .sort(
        (left, right) =>
          (parseNumber(right.summary?.temperature) ?? Number.NEGATIVE_INFINITY) -
          (parseNumber(left.summary?.temperature) ?? Number.NEGATIVE_INFINITY)
      )[0];
    const humidRecord = recordsWithSummary
      .filter((record) => parseNumber(record.summary?.humidity) !== null)
      .sort(
        (left, right) =>
          (parseNumber(right.summary?.humidity) ?? Number.NEGATIVE_INFINITY) -
          (parseNumber(left.summary?.humidity) ?? Number.NEGATIVE_INFINITY)
      )[0];
    const temperatureValues = recordsWithSummary
      .map((record) => parseNumber(record.summary?.temperature))
      .filter((value): value is number => value !== null);
    const temperatureSpread =
      temperatureValues.length > 1 ? Math.max(...temperatureValues) - Math.min(...temperatureValues) : null;

    return [
      {
        id: "cities",
        label: "Cities In Compare / 对比城市",
        value: `${compareRecords.value.length}`,
        detail: "Compare selection is URL-backed, so the same monitoring set survives reload and deep links.",
      },
      {
        id: "warmest",
        label: "Warmest City / 当前最暖",
        value: warmestRecord ? `${warmestRecord.city.city} ${formatTemperature(warmestRecord.summary?.temperature)}` : "--",
        detail: warmestRecord
          ? `${warmestRecord.summary?.textBilingual.en} · ${warmestRecord.city.province}`
          : "Weather summaries are still loading for the active compare set.",
      },
      {
        id: "humidity",
        label: "Highest Humidity / 最高湿度",
        value: humidRecord ? `${humidRecord.city.city} ${humidRecord.summary?.humidity}%` : "--",
        detail: humidRecord
          ? `Wind ${formatWind({ scale: humidRecord.summary?.windScale })} · ${humidRecord.city.province}`
          : "Humidity signals are unavailable for the current compare selection.",
      },
      {
        id: "spread",
        label: "Temperature Spread / 温差跨度",
        value:
          temperatureSpread !== null
            ? `${Math.round(
                temperatureUnit.value === "fahrenheit" ? (temperatureSpread * 9) / 5 : temperatureSpread
              )}°${temperatureUnit.value === "fahrenheit" ? "F" : "C"}`
            : "--",
        detail:
          temperatureSpread !== null
            ? "A wider spread signals where the saved cities are currently diverging the most."
            : "Add at least two cities with live summaries to unlock the spread readout.",
      },
    ];
  });

  const syncRouteQuery = async (): Promise<void> => {
    const nextGroup = selectedGroup.value;
    const nextCompare = compareLocationIds.value.length ? compareLocationIds.value.join(",") : undefined;
    const currentGroup = typeof route.query.group === "string" ? route.query.group : undefined;
    const currentCompare = compareQueryKey(route.query.compare);

    if (currentGroup === nextGroup && currentCompare === nextCompare) {
      return;
    }

    await router.replace({
      query: {
        ...route.query,
        group: nextGroup,
        compare: nextCompare,
      },
    });
  };

  const backfillCompareSelection = async (): Promise<void> => {
    if (!shouldBackfillCompare.value || compareLocationIds.value.length || !savedCities.value.length) {
      return;
    }

    workspaceStore.syncCompareLocations(savedCities.value.slice(0, 2).map((city) => getSavedCityLocationId(city)));
    shouldBackfillCompare.value = false;
    await syncRouteQuery();
  };

  const selectGroup = async (group: WorkspaceGroup): Promise<void> => {
    workspaceStore.setSelectedGroup(group);
    await syncRouteQuery();
  };

  const toggleCompareForCity = async (locationId: string): Promise<void> => {
    workspaceStore.toggleCompareLocation(locationId);
    shouldBackfillCompare.value = false;
    await syncRouteQuery();
  };

  const toggleFavoriteForCity = (locationId: string): void => {
    workspaceStore.toggleFavoriteLocation(locationId);
  };

  const openCity = async (city: SavedCity): Promise<void> => {
    const locationId = getSavedCityLocationId(city);
    workspaceStore.rememberRecentLocation(locationId);
    const nextCompare = compareLocationIds.value.length ? compareLocationIds.value.join(",") : undefined;

    await router.push({
      name: "cityview",
      params: {
        province: city.province,
        city: city.city,
      },
      query: {
        id: city.id,
        qid: locationId,
        lat: city.latitude,
        lon: city.longitude,
        group: selectedGroup.value,
        compare: nextCompare,
      },
    });
  };

  const removeCity = async (cityId: string): Promise<void> => {
    await locationsStore.removeSavedCityById(cityId);
  };

  watch(
    () => [route.query.group, route.query.compare, workspaceDefaultGroup.value],
    () => {
      const nextGroup = typeof route.query.group === "string" ? route.query.group : workspaceDefaultGroup.value;
      workspaceStore.setSelectedGroup(nextGroup);

      const compareIdsFromQuery = parseCompareQuery(route.query.compare);
      if (compareIdsFromQuery.length) {
        workspaceStore.syncCompareLocations(compareIdsFromQuery);
        shouldBackfillCompare.value = false;
      } else {
        shouldBackfillCompare.value = shouldUseDefaultCompare(compareLocationIds.value.length > 0, route.query.compare);
      }

      void syncRouteQuery();
    },
    { immediate: true }
  );

  watch(
    savedCities,
    (cities) => {
      const validLocationIds = cities.map((city) => getSavedCityLocationId(city));
      workspaceStore.pruneLocationIds(validLocationIds);
      void weatherStore.hydrateSavedCitySummaries(cities);
      void backfillCompareSelection();
      void syncRouteQuery();
    },
    { immediate: true }
  );

  watch(
    compareTrendCities,
    async (records) => {
      const requestId = ++trendRequestId;
      const nextLocationIds = records.map((record) => record.locationId);

      trendStates.value = Object.fromEntries(
        nextLocationIds.map((locationId) => [
          locationId,
          trendStates.value[locationId] ?? {
            status: "loading",
            data: null,
            reason: "Loading workspace trend data. / 正在加载工作台趋势数据。",
          },
        ])
      );

      if (!nextLocationIds.length) {
        return;
      }

      const nextEntries = await Promise.all(
        records.map(async (record) => {
          try {
            const location = await resolveSavedCityLocation(record.city);
            if (!location) {
              return [
                record.locationId,
                {
                  status: "unavailable",
                  data: null,
                  reason: "The saved city can no longer be resolved for historical trends.",
                } satisfies WorkspaceTrendPanelState,
              ] as const;
            }

            return [record.locationId, await getHistoricalTrends(location, { days: 5 })] as const;
          } catch (error) {
            return [
              record.locationId,
              {
                status: "unavailable",
                data: null,
                reason:
                  error instanceof Error
                    ? error.message
                    : "Historical trends are unavailable for this workspace card.",
              } satisfies WorkspaceTrendPanelState,
            ] as const;
          }
        })
      );

      if (requestId !== trendRequestId) {
        return;
      }

      trendStates.value = Object.fromEntries(nextEntries);
    },
    { immediate: true }
  );

  void locationsStore.loadSavedCities();

  return {
    activeGroupCopy,
    compareMetrics,
    compareRecords,
    groupCounts,
    prefersReducedMotion,
    removeCity,
    selectGroup,
    selectedGroup,
    syncErrorReason,
    syncStatus,
    toggleCompareForCity,
    toggleFavoriteForCity,
    visibleCityRecords,
    workspaceSummary,
    openCity,
  };
};
