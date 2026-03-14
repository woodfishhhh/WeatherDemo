import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useWeatherStore } from "@/features/weather/stores/weather";
import type { CityWeatherBundle, LocationRecord } from "@/features/weather/types";

const {
  getCityWeatherBundleMock,
  getSavedCityWeatherSummaryMock,
  resolveLocationMock,
} = vi.hoisted(() => ({
  resolveLocationMock: vi.fn(),
  getCityWeatherBundleMock: vi.fn(),
  getSavedCityWeatherSummaryMock: vi.fn(),
}));

vi.mock("@/features/weather/services/qweather", () => ({
  resolveLocation: resolveLocationMock,
  getCityWeatherBundle: getCityWeatherBundleMock,
  getSavedCityWeatherSummary: getSavedCityWeatherSummaryMock,
}));

const beijingLocation: LocationRecord = {
  id: "101010100",
  name: "北京",
  province: "北京市",
  latitude: "39.90499",
  longitude: "116.40529",
  timezone: "Asia/Shanghai",
};

const beijingBundle: CityWeatherBundle = {
  location: beijingLocation,
  current: {
    observationTime: "2026-03-13T12:00+08:00",
    temperature: "23",
    feelsLike: "22",
    text: "晴",
    textBilingual: { en: "Sunny", zh: "晴" },
    icon: "100",
    humidity: "26",
    windDirection: "北风",
    windScale: "3",
    windSpeed: "11",
    pressure: "1015",
    visibility: "20",
  },
  hourly: [],
  daily: [],
  airQuality: {
    status: "unavailable",
    data: null,
    reason: "Air quality is unavailable for the current plan.",
  },
};

describe("useWeatherStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("loads active city weather through the normalized service layer", async () => {
    resolveLocationMock.mockResolvedValue(beijingLocation);
    getCityWeatherBundleMock.mockResolvedValue(beijingBundle);

    const store = useWeatherStore();
    const result = await store.loadCityWeather({
      id: "101010100",
      city: "北京",
      province: "北京市",
    });

    expect(result?.location.id).toBe("101010100");
    expect(store.activeCityStatus).toBe("ready");
    expect(store.activeCityWeather?.current?.temperature).toBe("23");
  });

  it("hydrates saved city weather summaries for card rendering", async () => {
    getSavedCityWeatherSummaryMock.mockResolvedValue({
      temperature: "23",
      text: "晴",
      textBilingual: { en: "Sunny", zh: "晴" },
      icon: "100",
      humidity: "26",
      windScale: "3",
      windSpeed: "11",
      province: "北京市",
    });

    const store = useWeatherStore();
    await store.hydrateSavedCitySummaries([
      {
        id: "101010100",
        province: "北京市",
        city: "北京",
        locationId: "101010100",
        latitude: "39.90499",
        longitude: "116.40529",
      },
    ]);

    expect(store.getSavedCitySummary({
      id: "101010100",
      province: "北京市",
      city: "北京",
      locationId: "101010100",
      latitude: "39.90499",
      longitude: "116.40529",
    })?.textBilingual.en).toBe("Sunny");
  });

  it("deduplicates repeated saved-city hydration calls within the summary ttl window", async () => {
    getSavedCityWeatherSummaryMock.mockResolvedValue({
      temperature: "23",
      text: "晴",
      textBilingual: { en: "Sunny", zh: "晴" },
      icon: "100",
      humidity: "26",
      windScale: "3",
      windSpeed: "11",
      province: "北京市",
    });

    const store = useWeatherStore();
    const city = {
      id: "101010100",
      province: "北京市",
      city: "北京",
      locationId: "101010100",
      latitude: "39.90499",
      longitude: "116.40529",
    };

    await Promise.all([
      store.hydrateSavedCitySummaries([city]),
      store.hydrateSavedCitySummaries([city]),
    ]);
    await store.hydrateSavedCitySummaries([city]);

    expect(getSavedCityWeatherSummaryMock).toHaveBeenCalledTimes(1);
  });

  it("ignores stale city-weather responses when route requests race", async () => {
    let resolveFirstLocation!: (value: LocationRecord | null) => void;
    let resolveSecondLocation!: (value: LocationRecord | null) => void;

    getCityWeatherBundleMock.mockImplementation(async (location: LocationRecord) =>
      location.id === "101020100"
        ? {
            ...beijingBundle,
            location: {
              ...beijingBundle.location,
              id: "101020100",
              name: "上海",
              province: "上海市",
            },
            current: {
              ...beijingBundle.current!,
              temperature: "18",
            },
          }
        : beijingBundle
    );

    resolveLocationMock
      .mockImplementationOnce(
        () =>
          new Promise<LocationRecord | null>((resolve) => {
            resolveFirstLocation = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<LocationRecord | null>((resolve) => {
            resolveSecondLocation = resolve;
          })
      );

    const store = useWeatherStore();
    const firstRequest = store.loadCityWeather({
      id: "101010100",
      city: "北京",
      province: "北京市",
    });
    const secondRequest = store.loadCityWeather({
      id: "101020100",
      city: "上海",
      province: "上海市",
    });

    resolveFirstLocation(beijingLocation);
    resolveSecondLocation({
      ...beijingLocation,
      id: "101020100",
      name: "上海",
      province: "上海市",
    });

    await Promise.all([firstRequest, secondRequest]);

    expect(store.activeLocation?.id).toBe("101020100");
    expect(store.activeCityWeather?.current?.temperature).toBe("18");
    expect(getCityWeatherBundleMock).toHaveBeenCalledTimes(1);
  });

  it("does not restore stale saved-city summaries after a newer hydration clears the list", async () => {
    let resolveSummary!: (value: {
      temperature: string;
      text: string;
      textBilingual: { en: string; zh: string };
      icon: string;
      humidity: string;
      windScale: string;
      windSpeed: string;
      province: string;
    }) => void;

    getSavedCityWeatherSummaryMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSummary = resolve;
        })
    );

    const store = useWeatherStore();
    const city = {
      id: "101010100",
      province: "北京市",
      city: "北京",
      locationId: "101010100",
      latitude: "39.90499",
      longitude: "116.40529",
    };

    const firstRequest = store.hydrateSavedCitySummaries([city]);
    const clearingRequest = store.hydrateSavedCitySummaries([]);

    await clearingRequest;
    resolveSummary({
      temperature: "23",
      text: "晴",
      textBilingual: { en: "Sunny", zh: "晴" },
      icon: "100",
      humidity: "26",
      windScale: "3",
      windSpeed: "11",
      province: "北京市",
    });
    await firstRequest;

    expect(store.getSavedCitySummary(city)).toBeUndefined();
  });
});
