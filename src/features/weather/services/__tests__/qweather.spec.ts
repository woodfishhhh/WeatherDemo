import { describe, expect, it } from "vitest";
import { searchLocations } from "@/features/weather/services/qweather";

describe("searchLocations", () => {
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
});

