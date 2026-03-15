import { mount } from "@vue/test-utils";
import { nextTick, shallowRef } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedCity } from "@/features/locations/services/persistence";
import type { CurrentLocationWeather } from "@/features/locations/stores/locations";
import type { LocationRecord } from "@/features/weather/types";

const {
  clearSearchMock,
  formatTemperatureMock,
  formatWindMock,
  getSavedCitySummaryMock,
  hydrateWorkspaceMock,
  hydrateSavedCitySummariesMock,
  loadSavedCitiesMock,
  rememberRecentLocationMock,
  requestCurrentLocationMock,
  routerPushMock,
  searchByKeywordMock,
  useLocationsStoreMock,
  useRouterMock,
  useWeatherStoreMock,
  useWorkspaceStoreMock,
} = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  useLocationsStoreMock: vi.fn(),
  useWeatherStoreMock: vi.fn(),
  useWorkspaceStoreMock: vi.fn(),
  searchByKeywordMock: vi.fn(),
  clearSearchMock: vi.fn(),
  requestCurrentLocationMock: vi.fn(),
  loadSavedCitiesMock: vi.fn(),
  hydrateSavedCitySummariesMock: vi.fn(),
  getSavedCitySummaryMock: vi.fn(),
  hydrateWorkspaceMock: vi.fn(),
  rememberRecentLocationMock: vi.fn(),
  routerPushMock: vi.fn(),
  formatTemperatureMock: vi.fn((value: string | undefined) => value ? `${value}°C` : "--"),
  formatWindMock: vi.fn(({ scale }: { scale?: string }) => scale ? `Scale ${scale}` : "--"),
}));

vi.mock("pinia", () => ({
  storeToRefs: (store: { __refs: Record<string, unknown> }) => store.__refs,
}));

vi.mock("vue-router", () => ({
  useRouter: useRouterMock,
}));

vi.mock("@/features/locations/stores/locations", () => ({
  useLocationsStore: useLocationsStoreMock,
}));

vi.mock("@/features/workspace/stores/workspace", () => ({
  useWorkspaceStore: useWorkspaceStoreMock,
}));

vi.mock("@/features/weather/stores/weather", () => ({
  useWeatherStore: useWeatherStoreMock,
}));

vi.mock("@/features/settings/composables/useWeatherDisplayPreferences", () => ({
  useWeatherDisplayPreferences: () => ({
    formatTemperature: formatTemperatureMock,
    formatWind: formatWindMock,
  }),
}));

import { useHomeLocationSearch } from "@/features/locations/composables/useHomeLocationSearch";

let compareLocationIdsRef: ReturnType<typeof shallowRef<string[]>>;
let currentLocationErrorRef: ReturnType<typeof shallowRef<string>>;
let currentLocationRef: ReturnType<typeof shallowRef<CurrentLocationWeather | null>>;
let currentLocationStatusRef: ReturnType<typeof shallowRef<string>>;
let recentLocationIdsRef: ReturnType<typeof shallowRef<string[]>>;
let savedCitiesRef: ReturnType<typeof shallowRef<SavedCity[]>>;
let searchErrorRef: ReturnType<typeof shallowRef<string>>;
let searchResultsRef: ReturnType<typeof shallowRef<LocationRecord[]>>;
let searchStatusRef: ReturnType<typeof shallowRef<string>>;

const flushComposable = async (): Promise<void> => {
  await Promise.resolve();
  await nextTick();
};

const setupStores = (): void => {
  compareLocationIdsRef = shallowRef(["101010100", "101020100"]);
  currentLocationErrorRef = shallowRef("");
  currentLocationRef = shallowRef({
    location: {
      id: "101010100",
      name: "Beijing",
      province: "Beijing",
      latitude: "39.90499",
      longitude: "116.40529",
    },
    weather: {
      temperature: "23",
      text: "晴",
      textBilingual: {
        en: "Sunny",
        zh: "晴",
      },
      icon: "100",
      humidity: "35",
      windScale: "3",
      windSpeed: "12",
      province: "Beijing",
    },
  });
  currentLocationStatusRef = shallowRef("ready");
  recentLocationIdsRef = shallowRef<string[]>([]);
  savedCitiesRef = shallowRef([
    {
      id: "saved-beijing",
      city: "北京",
      province: "北京市",
      locationId: "101010100",
      latitude: "39.90499",
      longitude: "116.40529",
    },
    {
      id: "saved-shanghai",
      city: "上海",
      province: "上海市",
      locationId: "101020100",
      latitude: "31.23037",
      longitude: "121.47370",
    },
  ]);
  searchErrorRef = shallowRef("");
  searchResultsRef = shallowRef<LocationRecord[]>([]);
  searchStatusRef = shallowRef("idle");

  routerPushMock.mockResolvedValue(undefined);
  searchByKeywordMock.mockResolvedValue([]);
  clearSearchMock.mockImplementation(() => {
    searchResultsRef.value = [];
    searchErrorRef.value = "";
    searchStatusRef.value = "idle";
  });
  requestCurrentLocationMock.mockResolvedValue(null);
  loadSavedCitiesMock.mockResolvedValue(savedCitiesRef.value);
  hydrateSavedCitySummariesMock.mockResolvedValue({});
  getSavedCitySummaryMock.mockImplementation((city: SavedCity) => {
    if ((city.locationId || city.id) === "101020100") {
      return {
        temperature: "18",
        text: "多云",
        textBilingual: {
          en: "Cloudy",
          zh: "多云",
        },
        icon: "101",
        humidity: "64",
        windScale: "4",
        windSpeed: "22",
        precipitation: "1.6",
        province: "上海市",
      };
    }

    return {
      temperature: "23",
      text: "晴",
      textBilingual: {
        en: "Sunny",
        zh: "晴",
      },
      icon: "100",
      humidity: "31",
      windScale: "3",
      windSpeed: "12",
      precipitation: "0.4",
      province: "北京市",
    };
  });
  hydrateWorkspaceMock.mockImplementation(() => undefined);
  rememberRecentLocationMock.mockImplementation((locationId: string) => {
    recentLocationIdsRef.value = [locationId];
    return recentLocationIdsRef.value;
  });

  useRouterMock.mockReturnValue({
    push: routerPushMock,
  });
  useLocationsStoreMock.mockReturnValue({
    __refs: {
      currentLocation: currentLocationRef,
      currentLocationError: currentLocationErrorRef,
      currentLocationStatus: currentLocationStatusRef,
      savedCities: savedCitiesRef,
      searchError: searchErrorRef,
      searchResults: searchResultsRef,
      searchStatus: searchStatusRef,
    },
    clearSearch: clearSearchMock,
    loadSavedCities: loadSavedCitiesMock,
    requestCurrentLocation: requestCurrentLocationMock,
    searchByKeyword: searchByKeywordMock,
  });
  useWeatherStoreMock.mockReturnValue({
    getSavedCitySummary: getSavedCitySummaryMock,
    hydrateSavedCitySummaries: hydrateSavedCitySummariesMock,
  });
  useWorkspaceStoreMock.mockReturnValue({
    __refs: {
      compareLocationIds: compareLocationIdsRef,
      recentLocationIds: recentLocationIdsRef,
    },
    hydrate: hydrateWorkspaceMock,
    rememberRecentLocation: rememberRecentLocationMock,
  });
};

const mountComposable = () => {
  let api: ReturnType<typeof useHomeLocationSearch> | undefined;
  const wrapper = mount({
    template: "<div />",
    setup() {
      api = useHomeLocationSearch();
      return {};
    },
  });

  if (!api) {
    throw new Error("useHomeLocationSearch did not initialize");
  }

  return {
    api,
    wrapper,
  };
};

describe("useHomeLocationSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hydrates on mount and preserves current-location route handoff semantics", async () => {
    const { api, wrapper } = mountComposable();
    await flushComposable();

    expect(hydrateWorkspaceMock).toHaveBeenCalledTimes(1);
    expect(loadSavedCitiesMock).toHaveBeenCalledTimes(1);
    expect(hydrateSavedCitySummariesMock).toHaveBeenCalledWith(savedCitiesRef.value);

    api.openCurrentLocation();
    await flushComposable();

    expect(rememberRecentLocationMock).toHaveBeenCalledWith("101010100");
    expect(routerPushMock).toHaveBeenCalledWith({
      name: "cityview",
      params: {
        province: "Beijing",
        city: "Beijing",
      },
      query: {
        id: "saved-beijing",
        qid: "101010100",
        lat: "39.90499",
        lon: "116.40529",
        group: "recent",
        compare: "101010100,101020100",
      },
    });

    wrapper.unmount();
  });

  it("derives saved-city intelligence and compare preset continuity from workspace state", async () => {
    const { api, wrapper } = mountComposable();
    await flushComposable();

    expect(api.savedCityIntelligence.value).toMatchObject({
      city: expect.objectContaining({ city: "上海" }),
      severity: "moderate",
    });
    expect(api.comparePreset.value).toMatchObject({
      label: "北京 · 上海",
      compareQuery: "101010100,101020100",
    });

    await api.openComparePreset();

    expect(routerPushMock).toHaveBeenCalledWith({
      name: "workspace",
      query: {
        group: "all",
        compare: "101010100,101020100",
      },
    });

    wrapper.unmount();
  });

  it("abandons stale debounced searches and keeps only the latest suggestion set", async () => {
    vi.useFakeTimers();
    const beihaiResults = [
      {
        id: "450500",
        name: "Beihai",
        province: "Guangxi",
        latitude: "21.48",
        longitude: "109.12",
      },
    ];
    const beijingResults = [
      {
        id: "101010100",
        name: "Beijing",
        province: "Beijing",
        latitude: "39.90",
        longitude: "116.40",
      },
    ];

    searchByKeywordMock.mockImplementation((keyword: string, options: { signal?: AbortSignal } = {}) =>
      new Promise((resolve) => {
        const results = keyword === "bei" ? beihaiResults : beijingResults;
        const timer = setTimeout(() => {
          if (options.signal?.aborted) {
            resolve(searchResultsRef.value);
            return;
          }

          searchResultsRef.value = results;
          searchStatusRef.value = "ready";
          resolve(results);
        }, keyword === "bei" ? 200 : 0);

        options.signal?.addEventListener("abort", () => {
          clearTimeout(timer);
          resolve(searchResultsRef.value);
        }, { once: true });
      })
    );

    const { api, wrapper } = mountComposable();
    await flushComposable();

    api.searchQuery.value = "bei";
    await nextTick();
    await vi.advanceTimersByTimeAsync(400);

    expect(searchByKeywordMock).toHaveBeenCalledTimes(1);
    expect(searchByKeywordMock.mock.calls[0]?.[0]).toBe("bei");

    const firstSignal = searchByKeywordMock.mock.calls[0]?.[1]?.signal as AbortSignal;
    api.searchQuery.value = "beijing";
    await nextTick();

    expect(firstSignal.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(1);
    await flushComposable();

    expect(searchByKeywordMock).toHaveBeenCalledTimes(2);
    expect(searchByKeywordMock.mock.calls[1]?.[0]).toBe("beijing");
    expect(searchResultsRef.value).toEqual(beijingResults);
    expect(api.showTips.value).toBe(true);

    await vi.advanceTimersByTimeAsync(250);
    await flushComposable();

    expect(searchResultsRef.value).toEqual(beijingResults);

    wrapper.unmount();
  });
});
