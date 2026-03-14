import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "@/lib/http/client";
import type { LocationRecord } from "@/features/weather/types";
import {
  __resetQWeatherRequestCache,
  getCurrentWeather,
  searchLocations,
} from "@/features/weather/services/qweather";

const beijingLocation: LocationRecord = {
  id: "101010100",
  name: "北京",
  province: "北京市",
  latitude: "39.90499",
  longitude: "116.40529",
  timezone: "Asia/Shanghai",
};

describe("searchLocations", () => {
  beforeEach(() => {
    __resetQWeatherRequestCache();
    vi.restoreAllMocks();
  });

  it("normalizes qweather lookup results into canonical locations", async () => {
    const results = await searchLocations("北京");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "101010100",
      name: "北京",
      province: "北京市",
      district: "北京",
      latitude: "39.90499",
      longitude: "116.40529",
      timezone: "Asia/Shanghai",
    });
  });

  it("does not cache keyword search suggestions", async () => {
    const getSpy = vi.spyOn(httpClient, "get");

    await searchLocations("北京");
    await searchLocations("北京");

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it("deduplicates and caches current weather requests within the TTL window", async () => {
    const getSpy = vi.spyOn(httpClient, "get");

    await Promise.all([getCurrentWeather(beijingLocation), getCurrentWeather(beijingLocation)]);
    await getCurrentWeather(beijingLocation);

    expect(getSpy).toHaveBeenCalledTimes(1);
  });
});
