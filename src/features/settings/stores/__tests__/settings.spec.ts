import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useSettingsStore } from "@/features/settings/stores/settings";

describe("useSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it("hydrates persisted settings safely and persists updates", () => {
    window.localStorage.setItem(
      "weather-platform-settings",
      JSON.stringify({
        temperatureUnit: "fahrenheit",
        reducedMotion: true,
        workspaceDefaultGroup: "recent",
      })
    );

    const store = useSettingsStore();
    store.hydrate();

    expect(store.temperatureUnit).toBe("fahrenheit");
    expect(store.reducedMotion).toBe(true);

    store.updateSettings({ timezonePolicy: "device" });

    expect(JSON.parse(window.localStorage.getItem("weather-platform-settings") || "{}")).toMatchObject({
      temperatureUnit: "fahrenheit",
      reducedMotion: true,
      workspaceDefaultGroup: "recent",
      timezonePolicy: "device",
    });
  });
});
