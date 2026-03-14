import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDateWithTimezonePolicy,
  formatTemperatureValue,
  formatWindValue,
  resolveReducedMotionPreference,
  useWeatherDisplayPreferences,
} from "@/features/settings/composables/useWeatherDisplayPreferences";
import { useSettingsStore } from "@/features/settings/stores/settings";

describe("useWeatherDisplayPreferences helpers", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

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

  it("reads the active settings store without re-owning hydration", () => {
    const store = useSettingsStore();
    store.updateSettings({
      temperatureUnit: "fahrenheit",
      windUnit: "kph",
      timezonePolicy: "device",
    });
    const hydrateSpy = vi.spyOn(store, "hydrate");

    const preferences = useWeatherDisplayPreferences();

    expect(hydrateSpy).not.toHaveBeenCalled();
    expect(preferences.temperatureUnit.value).toBe("fahrenheit");
    expect(preferences.windUnit.value).toBe("kph");
    expect(preferences.timezonePolicy.value).toBe("device");
  });

  it("keeps browser reduced-motion preference authoritative unless the user explicitly forces reduction on", () => {
    expect(
      resolveReducedMotionPreference({
        reducedMotion: false,
        systemPrefersReducedMotion: true,
      })
    ).toBe(true);
    expect(
      resolveReducedMotionPreference({
        reducedMotion: null,
        systemPrefersReducedMotion: true,
      })
    ).toBe(true);
    expect(
      resolveReducedMotionPreference({
        reducedMotion: true,
        systemPrefersReducedMotion: false,
      })
    ).toBe(true);
    expect(
      resolveReducedMotionPreference({
        reducedMotion: false,
        systemPrefersReducedMotion: false,
      })
    ).toBe(false);
  });
});
