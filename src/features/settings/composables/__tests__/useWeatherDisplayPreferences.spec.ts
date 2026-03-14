import { describe, expect, it } from "vitest";
import {
  formatDateWithTimezonePolicy,
  formatTemperatureValue,
  formatWindValue,
} from "@/features/settings/composables/useWeatherDisplayPreferences";

describe("useWeatherDisplayPreferences helpers", () => {
  it("formats temperatures and wind using the selected units", () => {
    expect(formatTemperatureValue("23", "celsius")).toBe("23°C");
    expect(formatTemperatureValue("23", "fahrenheit")).toBe("73°F");
    expect(formatWindValue({ speed: "12", scale: "3" }, "kph")).toBe("12 km/h");
    expect(formatWindValue({ scale: "3" }, "scale")).toBe("Scale 3");
  });

  it("formats dates using location or device timezone policies", () => {
    const sampleDate = "2026-01-14T08:00+08:00";
    const formatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    } as const;

    const locationTime = formatDateWithTimezonePolicy(
      sampleDate,
      formatOptions,
      "location",
      "America/New_York"
    );
    const deviceTime = formatDateWithTimezonePolicy(
      sampleDate,
      formatOptions,
      "device",
      "America/New_York"
    );

    const expectedDeviceTime = new Intl.DateTimeFormat("zh-CN", formatOptions).format(
      new Date(sampleDate)
    );

    expect(locationTime).toBe("19:00");
    expect(deviceTime).toBe(expectedDeviceTime);
  });
});
