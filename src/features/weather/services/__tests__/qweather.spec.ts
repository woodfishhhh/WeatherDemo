import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "@/lib/http/client";
import { server } from "@/test/msw/server";
import type { LocationRecord } from "@/features/weather/types";
import {
  __resetQWeatherRequestCache,
  getCurrentWeather,
  resolveLocation,
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

  it("falls back to city and province when the provided qid cannot be resolved", async () => {
    server.use(
      http.get("https://mock-api.qweather.test/geo/v2/city/lookup", ({ request }) => {
        const url = new URL(request.url);
        const location = url.searchParams.get("location");

        if (location === "0325d7f715f") {
          return HttpResponse.json(
            {
              error: {
                status: 400,
                title: "No Such Location",
                detail: "Cannot find the location of the query, please try another location.",
              },
            },
            { status: 400 }
          );
        }

        if (location === "南昌市 江西省") {
          return HttpResponse.json({
            code: "200",
            location: [
              {
                id: "101240101",
                name: "南昌市",
                adm1: "江西省",
                adm2: "南昌市",
                country: "中国",
                countryCode: "CN",
                tz: "Asia/Shanghai",
                lat: "28.682892",
                lon: "115.858197",
                adcode: "360100",
              },
            ],
          });
        }

        return HttpResponse.json(
          {
            error: {
              status: 404,
              title: "Unexpected Query",
            },
          },
          { status: 404 }
        );
      })
    );

    await expect(
      resolveLocation({
        id: "0325d7f715f",
        city: "南昌市",
        province: "江西省",
      })
    ).resolves.toMatchObject({
      id: "101240101",
      name: "南昌市",
      province: "江西省",
      latitude: "28.682892",
      longitude: "115.858197",
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
