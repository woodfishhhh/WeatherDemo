import { computed, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import type { SavedCity } from "@/features/locations/services/persistence";
import { useLocationsStore } from "@/features/locations/stores/locations";
import { useSystemReducedMotionPreference } from "@/features/settings/composables/useSystemReducedMotionPreference";
import {
  resolveReducedMotionPreference,
  useWeatherDisplayPreferences,
} from "@/features/settings/composables/useWeatherDisplayPreferences";
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

type WorkspaceCompareDelta = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

type WorkspaceComparePreset = {
  label: string;
  description: string;
  cityNames: string[];
  compareQuery: string;
};

type WorkspaceTrendInsight = {
  locationId: string;
  headline: string;
  summary: string;
  detail: string;
  status: "available" | "loading" | "unavailable";
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

const formatMetricNumber = (value: number, unit: string): string =>
  `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} ${unit}`;

const formatTemperatureDeltaValue = (value: number, isFahrenheit: boolean): string =>
  `${Math.round(isFahrenheit ? (value * 9) / 5 : value)}°${isFahrenheit ? "F" : "C"}`;

const getValueRange = (values: Array<number | null>): { min: number; max: number } | null => {
  const present = values.filter((value): value is number => value !== null);
  if (present.length < 2) {
    return null;
  }

  return {
    min: Math.min(...present),
    max: Math.max(...present),
  };
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
  const systemReducedMotion = useSystemReducedMotionPreference();
  const { formatTemperature, formatWind, temperatureUnit } = useWeatherDisplayPreferences();

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
    return resolveReducedMotionPreference({
      reducedMotion: reducedMotion.value,
      systemPrefersReducedMotion: systemReducedMotion.value,
    });
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

  const compareQueryValue = computed(() => compareLocationIds.value.join(","));

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
    const windiestRecord = recordsWithSummary
      .filter((record) => parseNumber(record.summary?.windSpeed) !== null)
      .sort(
        (left, right) =>
          (parseNumber(right.summary?.windSpeed) ?? Number.NEGATIVE_INFINITY) -
          (parseNumber(left.summary?.windSpeed) ?? Number.NEGATIVE_INFINITY)
      )[0];
    const precipitationRiskRecord = recordsWithSummary
      .filter((record) => parseNumber(record.summary?.precipitation) !== null)
      .sort(
        (left, right) =>
          (parseNumber(right.summary?.precipitation) ?? Number.NEGATIVE_INFINITY) -
          (parseNumber(left.summary?.precipitation) ?? Number.NEGATIVE_INFINITY)
      )[0];

    return [
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
        id: "windiest",
        label: "Windiest City / 风力最强",
        value: windiestRecord
          ? `${windiestRecord.city.city} ${formatMetricNumber(parseNumber(windiestRecord.summary?.windSpeed) ?? 0, "km/h")}`
          : "--",
        detail: windiestRecord
          ? `${windiestRecord.summary?.textBilingual.en} · ${windiestRecord.city.province}`
          : "Wind-speed signals are unavailable for the current compare selection.",
      },
      {
        id: "precipitation-risk",
        label: "Highest Precipitation Risk / 最高降水风险",
        value: precipitationRiskRecord
          ? `${precipitationRiskRecord.city.city} ${formatMetricNumber(parseNumber(precipitationRiskRecord.summary?.precipitation) ?? 0, "mm")}`
          : "--",
        detail: precipitationRiskRecord
          ? `${precipitationRiskRecord.summary?.textBilingual.en} · ${precipitationRiskRecord.city.province}`
          : "Daily precipitation signals are unavailable for the current compare selection.",
      },
    ];
  });

  const compareDeltas = computed<WorkspaceCompareDelta[]>(() => {
    const recordsWithSummary = compareRecords.value.filter((record) => record.summary);
    if (recordsWithSummary.length < 2) {
      return [];
    }

    const temperatureRange = getValueRange(recordsWithSummary.map((record) => parseNumber(record.summary?.temperature)));
    const humidityRange = getValueRange(recordsWithSummary.map((record) => parseNumber(record.summary?.humidity)));
    const windRange = getValueRange(recordsWithSummary.map((record) => parseNumber(record.summary?.windSpeed)));
    const precipitationRange = getValueRange(
      recordsWithSummary.map((record) => parseNumber(record.summary?.precipitation))
    );

    return [
      {
        id: "temperature-delta",
        label: "Temperature Delta / 温度差",
        value: temperatureRange
          ? formatTemperatureDeltaValue(
              temperatureRange.max - temperatureRange.min,
              temperatureUnit.value === "fahrenheit"
            )
          : "--",
        detail: "Current temperature spread across the active compare set.",
      },
      {
        id: "humidity-delta",
        label: "Humidity Delta / 湿度差",
        value: humidityRange ? `${Math.round(humidityRange.max - humidityRange.min)}%` : "--",
        detail: "Relative humidity distance between the driest and most saturated city.",
      },
      {
        id: "wind-delta",
        label: "Wind Delta / 风速差",
        value: windRange ? formatMetricNumber(windRange.max - windRange.min, "km/h") : "--",
        detail: "Current wind-speed spread across the active compare set.",
      },
      {
        id: "precipitation-delta",
        label: "Precipitation Delta / 降水差",
        value: precipitationRange ? formatMetricNumber(precipitationRange.max - precipitationRange.min, "mm") : "--",
        detail: "Daily precipitation spread for the active compare set.",
      },
    ];
  });

  const comparePreset = computed<WorkspaceComparePreset | null>(() => {
    if (!compareRecords.value.length || !compareQueryValue.value) {
      return null;
    }

    const cityNames = compareRecords.value.map((record) => record.city.city);
    return {
      label: cityNames.join(" · "),
      description:
        "This compare preset is derived from the route query and persisted workspace state, so it survives reloads and deep links.",
      cityNames,
      compareQuery: compareQueryValue.value,
    };
  });

  const compareTrendInsights = computed<WorkspaceTrendInsight[]>(() =>
    compareRecords.value.slice(0, 2).map((record) => {
      if (record.trendState.status === "loading") {
        return {
          locationId: record.locationId,
          headline: "Trend loading",
          summary: "Historical quick insight is hydrating for this compare city.",
          detail: "Trend data is still loading for this compare city.",
          status: "loading" as const,
        };
      }

      if (record.trendState.status !== "available" || !record.trendState.data.length) {
        return {
          locationId: record.locationId,
          headline: "Trend unavailable",
          summary: "Historical quick insight is unavailable for this compare city.",
          detail:
            record.trendState.status === "unavailable"
              ? record.trendState.reason
              : "Trend data is still loading for this compare city.",
          status: "unavailable" as const,
        };
      }

      const temperatureRange = getValueRange(
        record.trendState.data.flatMap((point) => [parseNumber(point.temperatureMax), parseNumber(point.temperatureMin)])
      );
      const windRange = getValueRange(record.trendState.data.map((point) => parseNumber(point.windSpeed)));
      const precipitationPeak = Math.max(
        ...record.trendState.data
          .map((point) => parseNumber(point.precipitation))
          .filter((value): value is number => value !== null)
      );

      return {
        locationId: record.locationId,
        headline: temperatureRange
          ? `${formatTemperatureDeltaValue(
              temperatureRange.max - temperatureRange.min,
              temperatureUnit.value === "fahrenheit"
            )} swing`
          : "Trend snapshot",
        summary: `Peak wind ${windRange ? formatMetricNumber(windRange.max, "km/h") : "--"} · peak precip ${
          Number.isFinite(precipitationPeak) ? formatMetricNumber(precipitationPeak, "mm") : "--"
        }`,
        detail: `Five-day trend read for ${record.city.city}.`,
        status: "available",
      };
    })
  );

  const syncRouteQuery = async (): Promise<void> => {
      const nextGroup = selectedGroup.value;
    const nextCompare = compareQueryValue.value || undefined;
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
    compareDeltas,
    comparePreset,
    compareRecords,
    compareTrendInsights,
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
