import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { nextTick, reactive } from "vue";

const {
  getHistoricalTrendsMock,
  getSavedCitiesSnapshotMock,
  getSavedCityWeatherSummaryMock,
  loadSavedCitiesWithSyncMock,
  resolveLocationMock,
  resolveSavedCityLocationMock,
  routerPushMock,
  routerReplaceMock,
  saveSavedCitiesMock,
  useRouteMock,
  useRouterMock,
} = vi.hoisted(() => ({
  useRouteMock: vi.fn(),
  useRouterMock: vi.fn(),
  getSavedCitiesSnapshotMock: vi.fn(),
  loadSavedCitiesWithSyncMock: vi.fn(),
  saveSavedCitiesMock: vi.fn(),
  getSavedCityWeatherSummaryMock: vi.fn(),
  getHistoricalTrendsMock: vi.fn(),
  resolveLocationMock: vi.fn(),
  resolveSavedCityLocationMock: vi.fn(),
  routerReplaceMock: vi.fn(),
  routerPushMock: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: useRouteMock,
  useRouter: useRouterMock,
}));

vi.mock("@/features/locations/services/persistence", () => ({
  getSavedCitiesSnapshot: getSavedCitiesSnapshotMock,
  loadSavedCitiesWithSync: loadSavedCitiesWithSyncMock,
  saveSavedCities: saveSavedCitiesMock,
}));

vi.mock("@/features/weather/services/qweather", () => ({
  getHistoricalTrends: getHistoricalTrendsMock,
  getSavedCityWeatherSummary: getSavedCityWeatherSummaryMock,
  resolveLocation: resolveLocationMock,
}));

vi.mock("@/features/weather/utils/savedCityLocation", () => ({
  getSavedCityLocationId: (city: { id: string; locationId?: string }) => city.locationId || city.id,
  resolveSavedCityLocation: resolveSavedCityLocationMock,
}));

import { useWorkspaceDashboard } from "@/features/workspace/composables/useWorkspaceDashboard";
import type { SavedCity } from "@/features/locations/services/persistence";
import type {
  HistoricalTrendPoint,
  HistoricalTrendState,
  LocationRecord,
  SavedCityWeatherSummary,
} from "@/features/weather/types";
import { WORKSPACE_STORAGE_KEY, useWorkspaceStore } from "@/features/workspace/stores/workspace";

type RouteState = {
  query: Record<string, unknown>;
};

type DeferredTrendState = {
  locationId: string;
  resolve: (value: HistoricalTrendState) => void;
};

let currentRoute: RouteState;
let savedCitiesState: SavedCity[];

const createSavedCity = (locationId: string, city: string): SavedCity => ({
  id: `${locationId}-saved`,
  locationId,
  city,
  province: `${city}市`,
  latitude: "39.90499",
  longitude: "116.40529",
  timezone: "Asia/Shanghai",
});

const locationRecordForCity = (city: SavedCity): LocationRecord => ({
  id: city.locationId ?? city.id,
  name: city.city,
  province: city.province,
  latitude: city.latitude ?? "39.90499",
  longitude: city.longitude ?? "116.40529",
  timezone: city.timezone,
});

const summaryByLocationId: Record<
  string,
  Pick<SavedCityWeatherSummary, "temperature" | "humidity" | "windScale" | "windSpeed" | "province"> & {
    precipitation: string;
  }
> = {
  "101010100": {
    temperature: "21",
    humidity: "48",
    windScale: "3",
    windSpeed: "12",
    precipitation: "0.4",
    province: "北京市",
  },
  "101020100": {
    temperature: "18",
    humidity: "64",
    windScale: "4",
    windSpeed: "22",
    precipitation: "1.6",
    province: "上海市",
  },
  "101280101": {
    temperature: "27",
    humidity: "76",
    windScale: "2",
    windSpeed: "10",
    precipitation: "6.2",
    province: "广东省",
  },
};

const summaryForLocation = (locationId: string): SavedCityWeatherSummary => ({
  ...(summaryByLocationId[locationId] ?? summaryByLocationId["101010100"]),
  text: "晴",
  textBilingual: {
    en: `Sunny ${locationId}`,
    zh: `晴 ${locationId}`,
  },
  icon: "100",
});

const availableTrend = (overrides: Partial<HistoricalTrendPoint> = {}): HistoricalTrendState => ({
  status: "available",
  data: [
    {
      date: "2026-03-14",
      temperatureMax: "24",
      temperatureMin: "10",
      precipitation: "0.4",
      humidity: "48",
      windSpeed: "12",
      text: "晴",
      textBilingual: {
        en: "Sunny",
        zh: "晴",
      },
      icon: "100",
      ...overrides,
    },
  ],
});

const trendForLocation = (locationId: string): HistoricalTrendState => {
  if (locationId === "101020100") {
    return availableTrend({
      temperatureMax: "20",
      temperatureMin: "12",
      precipitation: "1.4",
      humidity: "63",
      windSpeed: "22",
    });
  }

  if (locationId === "101280101") {
    return availableTrend({
      temperatureMax: "30",
      temperatureMin: "19",
      precipitation: "6.2",
      humidity: "76",
      windSpeed: "10",
    });
  }

  return availableTrend({
    temperatureMax: "24",
    temperatureMin: "11",
    precipitation: "0.4",
    humidity: "48",
    windSpeed: "12",
  });
};

const setRouteQuery = (query: Record<string, unknown>): void => {
  currentRoute.query = query;
};

const applyRouteQueryPatch = (query: Record<string, unknown>): void => {
  const nextQuery = {
    ...currentRoute.query,
    ...query,
  };

  for (const [key, value] of Object.entries(nextQuery)) {
    if (value === undefined) {
      delete nextQuery[key];
    }
  }

  currentRoute.query = nextQuery;
};

const settleWorkspace = async (): Promise<void> => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
};

describe("useWorkspaceDashboard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    savedCitiesState = [];
    currentRoute = reactive<RouteState>({
      query: {},
    });

    window.localStorage.clear();
    vi.clearAllMocks();

    useRouteMock.mockImplementation(() => currentRoute);
    routerReplaceMock.mockImplementation(async ({ query }: { query: Record<string, unknown> }) => {
      applyRouteQueryPatch(query);
    });
    routerPushMock.mockResolvedValue(undefined);
    useRouterMock.mockReturnValue({
      replace: routerReplaceMock,
      push: routerPushMock,
    });

    getSavedCitiesSnapshotMock.mockImplementation(() => savedCitiesState);
    loadSavedCitiesWithSyncMock.mockImplementation(async ({ onCloudUpdate } = {}) => {
      onCloudUpdate?.(savedCitiesState);
      return {
        cities: savedCitiesState,
        syncStatus: "ready",
      };
    });
    saveSavedCitiesMock.mockImplementation(async (cities: SavedCity[]) => {
      savedCitiesState = cities;
      return {
        cities,
        syncStatus: "ready",
      };
    });

    resolveSavedCityLocationMock.mockImplementation(async (city: SavedCity) => locationRecordForCity(city));
    resolveLocationMock.mockImplementation(async ({ id, city, province }) =>
      id
        ? {
            id,
            name: city ?? id,
            province: province ?? `${city ?? id}市`,
            latitude: "39.90499",
            longitude: "116.40529",
            timezone: "Asia/Shanghai",
          }
        : null
    );
    getSavedCityWeatherSummaryMock.mockImplementation(async (location: LocationRecord) => summaryForLocation(location.id));
    getHistoricalTrendsMock.mockImplementation(async (location: LocationRecord) => trendForLocation(location.id));
  });

  it("syncs route query state into the workspace group and compare selection", async () => {
    const beijing = createSavedCity("101010100", "北京");
    const shanghai = createSavedCity("101020100", "上海");
    const guangzhou = createSavedCity("101280101", "广州");
    savedCitiesState = [beijing, shanghai, guangzhou];
    setRouteQuery({
      group: "favorites",
      compare: "101010100,101020100",
    });

    const dashboard = useWorkspaceDashboard();
    await settleWorkspace();

    expect(dashboard.selectedGroup.value).toBe("favorites");
    expect(dashboard.compareRecords.value.map((record) => record.locationId)).toEqual([
      "101010100",
      "101020100",
    ]);

    await dashboard.selectGroup("recent");
    await settleWorkspace();

    expect(currentRoute.query.group).toBe("recent");

    await dashboard.toggleCompareForCity("101280101");
    await settleWorkspace();

    expect(currentRoute.query.compare).toBe("101010100,101020100,101280101");
    expect(dashboard.compareRecords.value.map((record) => record.locationId)).toEqual([
      "101010100",
      "101020100",
      "101280101",
    ]);
  });

  it("opens city detail without dropping the active workspace group or compare selection", async () => {
    const beijing = createSavedCity("101010100", "北京");
    const shanghai = createSavedCity("101020100", "上海");
    savedCitiesState = [beijing, shanghai];
    window.localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        favoriteLocationIds: ["101010100", "101020100"],
        recentLocationIds: [],
        compareLocationIds: ["101010100", "101020100"],
      })
    );
    setRouteQuery({
      group: "favorites",
      compare: "101010100,101020100",
    });

    const dashboard = useWorkspaceDashboard();
    await settleWorkspace();
    await dashboard.openCity(shanghai);

    const workspaceStore = useWorkspaceStore();
    expect(workspaceStore.recentLocationIds).toEqual(["101020100"]);
    expect(routerPushMock).toHaveBeenCalledWith({
      name: "cityview",
      params: {
        province: shanghai.province,
        city: shanghai.city,
      },
      query: {
        id: shanghai.id,
        qid: "101020100",
        lat: shanghai.latitude,
        lon: shanghai.longitude,
        group: "favorites",
        compare: "101010100,101020100",
      },
    });
  });

  it("backfills the first two saved cities into compare mode on first load", async () => {
    savedCitiesState = [
      createSavedCity("101010100", "北京"),
      createSavedCity("101020100", "上海"),
      createSavedCity("101280101", "广州"),
    ];

    const dashboard = useWorkspaceDashboard();
    await settleWorkspace();

    expect(dashboard.compareRecords.value.map((record) => record.locationId)).toEqual([
      "101010100",
      "101020100",
    ]);
    expect(currentRoute.query.group).toBe("all");
    expect(currentRoute.query.compare).toBe("101010100,101020100");
    expect(JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? "{}")).toMatchObject({
      compareLocationIds: ["101010100", "101020100"],
    });
  });

  it("derives ranking cards, compare deltas, trend insights, and preset copy from the active compare selection", async () => {
    savedCitiesState = [
      createSavedCity("101010100", "北京"),
      createSavedCity("101020100", "上海"),
      createSavedCity("101280101", "广州"),
    ];
    setRouteQuery({
      group: "all",
      compare: "101010100,101020100,101280101",
    });

    const dashboard = useWorkspaceDashboard();
    await settleWorkspace();

    expect(dashboard.compareMetrics.value.map((metric) => metric.id)).toEqual([
      "warmest",
      "humidity",
      "windiest",
      "precipitation-risk",
    ]);
    expect(dashboard.compareMetrics.value.find((metric) => metric.id === "warmest")).toMatchObject({
      value: "广州 27°C",
    });
    expect(dashboard.compareMetrics.value.find((metric) => metric.id === "windiest")).toMatchObject({
      value: "上海 22 km/h",
    });
    expect(dashboard.compareMetrics.value.find((metric) => metric.id === "precipitation-risk")).toMatchObject({
      value: "广州 6.2 mm",
    });

    expect(dashboard.compareDeltas.value).toEqual([
      expect.objectContaining({
        id: "temperature-delta",
        value: "9°C",
      }),
      expect.objectContaining({
        id: "humidity-delta",
        value: "28%",
      }),
      expect.objectContaining({
        id: "wind-delta",
        value: "12 km/h",
      }),
      expect.objectContaining({
        id: "precipitation-delta",
        value: "5.8 mm",
      }),
    ]);

    expect(dashboard.comparePreset.value).toMatchObject({
      label: "北京 · 上海 · 广州",
      compareQuery: "101010100,101020100,101280101",
      cityNames: ["北京", "上海", "广州"],
    });

    expect(dashboard.compareTrendInsights.value).toEqual([
      expect.objectContaining({
        locationId: "101010100",
        headline: "13°C swing",
      }),
      expect.objectContaining({
        locationId: "101020100",
        headline: "8°C swing",
      }),
    ]);
  });

  it("prunes saved-city favorites, recents, and compare ids after removals", async () => {
    const beijing = createSavedCity("101010100", "北京");
    const shanghai = createSavedCity("101020100", "上海");
    savedCitiesState = [beijing, shanghai];
    window.localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        favoriteLocationIds: ["101010100", "101020100"],
        recentLocationIds: ["101010100"],
        compareLocationIds: ["101010100", "101020100"],
      })
    );
    setRouteQuery({
      group: "all",
      compare: "101010100,101020100",
    });

    const dashboard = useWorkspaceDashboard();
    await settleWorkspace();

    await dashboard.removeCity(beijing.id);
    await settleWorkspace();

    const workspaceStore = useWorkspaceStore();
    expect(dashboard.workspaceSummary.value).toMatchObject({
      savedCount: 1,
      compareCount: 1,
    });
    expect(dashboard.compareRecords.value.map((record) => record.locationId)).toEqual(["101020100"]);
    expect(workspaceStore.favoriteLocationIds).toEqual(["101020100"]);
    expect(workspaceStore.recentLocationIds).toEqual([]);
    expect(workspaceStore.compareLocationIds).toEqual(["101020100"]);
    expect(currentRoute.query.compare).toBe("101020100");
  });

  it("keeps the latest trend request results when compare selections race", async () => {
    const deferredTrendStates: DeferredTrendState[] = [];
    savedCitiesState = [
      createSavedCity("101010100", "北京"),
      createSavedCity("101020100", "上海"),
      createSavedCity("101280101", "广州"),
    ];
    setRouteQuery({
      group: "all",
      compare: "101010100,101020100",
    });
    getHistoricalTrendsMock.mockImplementation(
      (location: LocationRecord) =>
        new Promise<HistoricalTrendState>((resolve) => {
          deferredTrendStates.push({
            locationId: location.id,
            resolve,
          });
        })
    );

    const dashboard = useWorkspaceDashboard();
    await settleWorkspace();

    expect(deferredTrendStates.map((entry) => entry.locationId)).toEqual(["101010100", "101020100"]);

    setRouteQuery({
      ...currentRoute.query,
      compare: "101020100,101280101",
    });
    await settleWorkspace();

    expect(deferredTrendStates.map((entry) => entry.locationId)).toEqual([
      "101010100",
      "101020100",
      "101020100",
      "101280101",
    ]);

    const initialBeijingTrend = deferredTrendStates[0];
    const initialShanghaiTrend = deferredTrendStates[1];
    const latestShanghaiTrend = deferredTrendStates[2];
    const latestGuangzhouTrend = deferredTrendStates[3];

    expect(initialBeijingTrend).toBeDefined();
    expect(initialShanghaiTrend).toBeDefined();
    expect(latestShanghaiTrend).toBeDefined();
    expect(latestGuangzhouTrend).toBeDefined();

    latestShanghaiTrend!.resolve(availableTrend({ temperatureMax: "latest-shanghai" }));
    latestGuangzhouTrend!.resolve(availableTrend({ temperatureMax: "latest-guangzhou" }));
    await settleWorkspace();

    initialBeijingTrend!.resolve(availableTrend({ temperatureMax: "stale-beijing" }));
    initialShanghaiTrend!.resolve(availableTrend({ temperatureMax: "stale-shanghai" }));
    await settleWorkspace();

    expect(dashboard.compareRecords.value.map((record) => record.locationId)).toEqual([
      "101020100",
      "101280101",
    ]);
    expect(dashboard.compareRecords.value).toHaveLength(2);

    const [shanghaiRecord, guangzhouRecord] = dashboard.compareRecords.value;

    expect(shanghaiRecord).toBeDefined();
    expect(guangzhouRecord).toBeDefined();

    expect(shanghaiRecord!.trendState).toMatchObject({
      status: "available",
      data: [expect.objectContaining({ temperatureMax: "latest-shanghai" })],
    });
    expect(guangzhouRecord!.trendState).toMatchObject({
      status: "available",
      data: [expect.objectContaining({ temperatureMax: "latest-guangzhou" })],
    });
  });
});
