import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useLocationsStore } from "@/features/locations/stores/locations";
import type { LocationRecord } from "@/features/weather/types";

const savedCitiesState = {
  cities: [] as Array<Record<string, string>>,
};

const {
  getSavedCitiesSnapshotMock,
  getSavedCityWeatherSummaryMock,
  loadSavedCitiesWithSyncMock,
  lookupLocationByCoordinatesMock,
  saveSavedCitiesMock,
  searchLocationsMock,
} = vi.hoisted(() => ({
  searchLocationsMock: vi.fn(),
  lookupLocationByCoordinatesMock: vi.fn(),
  getSavedCityWeatherSummaryMock: vi.fn(),
  getSavedCitiesSnapshotMock: vi.fn(),
  loadSavedCitiesWithSyncMock: vi.fn(),
  saveSavedCitiesMock: vi.fn(),
}));

vi.mock("@/features/weather/services/qweather", () => ({
  searchLocations: searchLocationsMock,
  lookupLocationByCoordinates: lookupLocationByCoordinatesMock,
  getSavedCityWeatherSummary: getSavedCityWeatherSummaryMock,
}));

vi.mock("@/services/savedCities", () => ({
  getSavedCitiesSnapshot: getSavedCitiesSnapshotMock,
  loadSavedCitiesWithSync: loadSavedCitiesWithSyncMock,
  saveSavedCities: saveSavedCitiesMock,
}));

const beijingLocation: LocationRecord = {
  id: "101010100",
  name: "北京",
  province: "北京市",
  latitude: "39.90499",
  longitude: "116.40529",
  timezone: "Asia/Shanghai",
};

describe("useLocationsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    savedCitiesState.cities = [];
    vi.clearAllMocks();

    getSavedCitiesSnapshotMock.mockImplementation(() => savedCitiesState.cities);
    loadSavedCitiesWithSyncMock.mockImplementation(async ({ onCloudUpdate } = {}) => {
      onCloudUpdate?.(savedCitiesState.cities);
      return savedCitiesState.cities;
    });
    saveSavedCitiesMock.mockImplementation(async (cities) => {
      savedCitiesState.cities = cities;
      return cities;
    });
  });

  it("searches locations and toggles saved records through the store", async () => {
    searchLocationsMock.mockResolvedValue([beijingLocation]);

    const store = useLocationsStore();
    const results = await store.searchByKeyword("北京");

    expect(results).toHaveLength(1);
    expect(store.searchStatus).toBe("ready");

    await store.toggleSavedCity({
      id: beijingLocation.id,
      province: beijingLocation.province,
      city: beijingLocation.name,
      locationId: beijingLocation.id,
      latitude: beijingLocation.latitude,
      longitude: beijingLocation.longitude,
    });

    expect(saveSavedCitiesMock).toHaveBeenCalledTimes(1);
    expect(store.isLocationSaved(beijingLocation)).toBe(true);
  });

  it("resolves current location weather summary from geolocation", async () => {
    lookupLocationByCoordinatesMock.mockResolvedValue(beijingLocation);
    getSavedCityWeatherSummaryMock.mockResolvedValue({
      temperature: "23",
      text: "晴",
      textBilingual: { en: "Sunny", zh: "晴" },
      icon: "100",
      humidity: "26",
      windScale: "3",
      province: "北京市",
    });

    const geolocation = {
      getCurrentPosition: (resolve: (position: GeolocationPosition) => void) => {
        resolve({
          coords: {
            latitude: 39.90499,
            longitude: 116.40529,
          },
        } as GeolocationPosition);
      },
    } as Geolocation;

    Object.defineProperty(globalThis.navigator, "geolocation", {
      configurable: true,
      value: geolocation,
    });

    const store = useLocationsStore();
    const result = await store.requestCurrentLocation();

    expect(result?.location.name).toBe("北京");
    expect(store.currentLocationStatus).toBe("ready");
  });
});
