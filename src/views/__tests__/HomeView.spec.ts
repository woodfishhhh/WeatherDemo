import { mount } from "@vue/test-utils";
import { shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useHomeLocationSearchMock } = vi.hoisted(() => ({
  useHomeLocationSearchMock: vi.fn(),
}));

vi.mock("@/features/locations/composables/useHomeLocationSearch", () => ({
  useHomeLocationSearch: useHomeLocationSearchMock,
}));

import HomeView from "@/views/HomeView.vue";

type HomeLocationSearchOptions = {
  comparePreset?: {
    label: string;
    cityNames: string[];
    compareQuery: string;
    descriptionEn: string;
    descriptionZh: string;
  } | null;
  comparePreview?: Array<{
    id: string;
    city: string;
    province: string;
    locationId?: string;
  }>;
  currentLocation?: {
    location: {
      id: string;
      name: string;
      province: string;
      district?: string;
      latitude: string;
      longitude: string;
    };
    weather: {
      temperature: string;
      textBilingual: {
        en: string;
        zh: string;
      };
      icon: string;
      humidity: string;
      windScale: string;
    };
  } | null;
  errorMessage?: string;
  isLoading?: boolean;
  isLocating?: boolean;
  isSearching?: boolean;
  locationErrorMessage?: string;
  recentLocations?: Array<{
    id: string;
    city: string;
    province: string;
    locationId?: string;
  }>;
  savedCities?: Array<{
    id: string;
    city: string;
    province: string;
    locationId?: string;
  }>;
  searchQuery?: string;
  searchResults?: Array<{
    id: string;
    name: string;
    province: string;
    district?: string;
  }>;
  savedCityIntelligence?: {
    city: {
      id: string;
      city: string;
      province: string;
      locationId?: string;
    };
    severity: "low" | "moderate" | "high";
    summaryEn: string;
    summaryZh: string;
    detail: string;
  } | null;
  showTips?: boolean;
  workspaceShortcutSummary?: {
    savedCount: number;
    recentCount: number;
    compareCount: number;
  };
};

const createHomeLocationSearchState = (options: HomeLocationSearchOptions = {}) => ({
  comparePreset: shallowRef(
    options.comparePreset === undefined ? {
      label: "北京 · 上海",
      cityNames: ["北京", "上海"],
      compareQuery: "101010100,101020100",
      descriptionEn: "Reopen the persisted compare lane directly from home without rebuilding the selection.",
      descriptionZh: "不用重新挑选城市，直接从首页恢复上一次的对比集合。",
    }
    : options.comparePreset
  ),
  comparePreview: shallowRef(
    options.comparePreview ?? [
      {
        id: "101010100",
        city: "北京",
        province: "北京市",
        locationId: "101010100",
      },
      {
        id: "101020100",
        city: "上海",
        province: "上海市",
        locationId: "101020100",
      },
    ]
  ),
  currentLocation: shallowRef(
    options.currentLocation === undefined
      ? {
        location: {
          id: "101010100",
          name: "Beijing",
          province: "Beijing",
          district: "Chaoyang",
          latitude: "39.90499",
          longitude: "116.40529",
        },
        weather: {
          temperature: "23",
          textBilingual: {
            en: "Sunny",
            zh: "晴",
          },
          icon: "100",
          humidity: "35",
          windScale: "3",
        },
      }
      : options.currentLocation
  ),
  errorMessage: shallowRef(options.errorMessage ?? ""),
  formatTemperature: vi.fn((temperature: string) => `${temperature}°C`),
  formatWind: vi.fn(({ scale }: { scale: string }) => `${scale}级`),
  isLoading: shallowRef(options.isLoading ?? false),
  isLocating: shallowRef(options.isLocating ?? false),
  isSearching: shallowRef(options.isSearching ?? false),
  locationErrorMessage: shallowRef(options.locationErrorMessage ?? ""),
  onInputBlur: vi.fn(),
  onInputFocus: vi.fn(),
  openComparePreset: vi.fn(),
  openCompareCity: vi.fn(),
  openCurrentLocation: vi.fn(),
  openRecentCity: vi.fn(),
  openSavedCity: vi.fn(),
  openWorkspace: vi.fn(),
  recentLocations: shallowRef(
    options.recentLocations ?? [
      {
        id: "saved-beijing",
        city: "北京",
        province: "北京市",
        locationId: "101010100",
      },
    ]
  ),
  requestCurrentLocation: vi.fn(),
  savedCities: shallowRef(
    options.savedCities ?? [
      {
        id: "saved-beijing",
        city: "北京",
        province: "北京市",
        locationId: "101010100",
      },
      {
        id: "saved-shanghai",
        city: "上海",
        province: "上海市",
        locationId: "101020100",
      },
    ]
  ),
  searchQuery: shallowRef(options.searchQuery ?? "beijing"),
  searchResults: shallowRef(
    options.searchResults ?? [
      {
        id: "101010100",
        name: "Beijing",
        province: "Beijing",
        district: "Chaoyang",
      },
    ]
  ),
  savedCityIntelligence: shallowRef(
    options.savedCityIntelligence === undefined ? {
      city: {
        id: "saved-guangzhou",
        city: "广州",
        province: "广东省",
        locationId: "101280101",
      },
      severity: "high",
      summaryEn: "This saved city is carrying the sharpest weather signal in your list.",
      summaryZh: "这座已收藏城市目前承载着最强的一档天气信号。",
      detail: "Precip 6.2 mm · Humidity 76% · Wind 10 km/h",
    }
    : options.savedCityIntelligence
  ),
  selectFirstTip: vi.fn(),
  selectTip: vi.fn(),
  showTips: shallowRef(options.showTips ?? true),
  workspaceShortcutSummary: shallowRef(
    options.workspaceShortcutSummary ?? {
      savedCount: 2,
      recentCount: 1,
      compareCount: 2,
    }
  ),
});

const renderHomeView = () =>
  mount(HomeView, {
    global: {
      stubs: {
        BilingualStack: {
          props: ["en", "zh"],
          template: `
            <div class="bilingual-stack-stub">
              <p>{{ en }}</p>
              <p>{{ zh }}</p>
            </div>
          `,
        },
        CityCardSkeleton: {
          template: '<div data-testid="city-card-skeleton-stub">CityCardSkeleton</div>',
        },
        CityList: {
          template: '<div data-testid="city-list-stub">CityList</div>',
        },
        PlatformPanel: {
          template: '<div class="platform-panel-stub"><slot /></div>',
        },
        PlatformStatRow: {
          props: ["label", "value"],
          template: '<div class="platform-stat-row-stub">{{ label }} {{ value }}</div>',
        },
        Suspense: {
          template: '<div class="suspense-stub"><slot /></div>',
        },
      },
    },
  });

describe("HomeView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders home route surfaces with stable test ids and preview content", () => {
    useHomeLocationSearchMock.mockReturnValue(createHomeLocationSearchState());

    const wrapper = renderHomeView();
    const searchInput = wrapper.get('[data-testid="home-search-input"]');

    expect((searchInput.element as HTMLInputElement).value).toBe("beijing");
    expect(wrapper.get('[data-testid="search-results"]').text()).toContain("Beijing");
    expect(wrapper.get('[data-testid="workspace-shortcuts"]').text()).toContain(
      "The strategic overview of your monitored ecosystems."
    );
    expect(wrapper.get('[data-testid="saved-city-intelligence-strip"]').text()).toContain("广州");
    expect(wrapper.findAll('[data-testid="recent-location-chip"]')).toHaveLength(1);
    expect(wrapper.get('[data-testid="workspace-shortcuts"]').text()).toContain("Comparative Analysis");
    expect(wrapper.get('[data-testid="home-compare-preset"]').text()).toContain("北京 · 上海");
    expect(wrapper.find('[data-testid="saved-locations-section"]').exists()).toBe(true);
  });

  it("keeps workspace, saved-city intelligence, and preview entrypoints wired to the composable handlers", async () => {
    const state = createHomeLocationSearchState();
    useHomeLocationSearchMock.mockReturnValue(state);

    const wrapper = renderHomeView();
    await wrapper.get('[data-testid="open-risk-city-button"]').trigger("click");
    await wrapper.get('[data-testid="open-workspace-button"]').trigger("click");
    await wrapper.get('[data-testid="home-open-compare-preset-button"]').trigger("click");
    await wrapper.get('[data-testid="home-continue-recent-button"]').trigger("click");
    await wrapper.get('[data-testid="recent-location-chip"]').trigger("click");
    await wrapper.get('[data-testid="compare-preview-card"]').trigger("click");

    expect(state.openSavedCity).toHaveBeenCalledWith(state.savedCityIntelligence.value.city);
    expect(state.openWorkspace).toHaveBeenCalledTimes(1);
    expect(state.openWorkspace).toHaveBeenCalledWith("all");
    expect(state.openComparePreset).toHaveBeenCalledTimes(1);
    expect(state.openRecentCity).toHaveBeenCalledWith(state.recentLocations.value[0]);
    expect(state.openRecentCity).toHaveBeenCalledWith(state.recentLocations.value[0]);
    expect(state.openCompareCity).toHaveBeenCalledWith(state.comparePreview.value[0]);
  });

  it("keeps the populated current-location card wired to the composable handoff", async () => {
    const state = createHomeLocationSearchState();
    useHomeLocationSearchMock.mockReturnValue(state);

    const wrapper = renderHomeView();
    const currentLocationCard = wrapper.get('[data-testid="current-location-card"]');

    await currentLocationCard.trigger("click");

    expect(state.openCurrentLocation).toHaveBeenCalledTimes(1);
  });

  it("renders the controlled search error state and current-location entry when location data is unavailable", async () => {
    const state = createHomeLocationSearchState({
      currentLocation: null,
      errorMessage: "Search failed",
      locationErrorMessage: "Permission denied",
      comparePreset: null,
      savedCityIntelligence: null,
      searchResults: [],
      showTips: false,
      searchQuery: "shanghai",
    });
    useHomeLocationSearchMock.mockReturnValue(state);

    const wrapper = renderHomeView();
    const currentLocationButton = wrapper.get('[data-testid="request-current-location-button"]');

    expect(wrapper.get('[data-testid="search-error"]').text()).toContain("Search failed");
    expect(wrapper.text()).toContain("Permission denied");
    expect(wrapper.find('[data-testid="saved-city-intelligence-fallback"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="home-compare-preset"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="workspace-shortcuts"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="saved-locations-section"]').exists()).toBe(true);

    await currentLocationButton.trigger("click");

    expect(state.requestCurrentLocation).toHaveBeenCalledTimes(1);
  });
});
