import { shallowRef } from "vue";
import { defineStore } from "pinia";

export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindUnit = "scale" | "kph";
export type TimezonePolicy = "location" | "device";
export type WorkspaceDefaultGroup = "all" | "favorites" | "recent";

export type PlatformSettings = {
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  timezonePolicy: TimezonePolicy;
  reducedMotion: boolean | null;
  workspaceDefaultGroup: WorkspaceDefaultGroup;
};

const STORAGE_KEY = "weather-platform-settings";

const defaultSettings: PlatformSettings = {
  temperatureUnit: "celsius",
  windUnit: "scale",
  timezonePolicy: "location",
  reducedMotion: null,
  workspaceDefaultGroup: "all",
};

const normalizeSettings = (input: unknown): PlatformSettings => {
  if (!input || typeof input !== "object") {
    return defaultSettings;
  }

  const raw = input as Partial<PlatformSettings>;

  return {
    temperatureUnit:
      raw.temperatureUnit === "fahrenheit" || raw.temperatureUnit === "celsius"
        ? raw.temperatureUnit
        : defaultSettings.temperatureUnit,
    windUnit: raw.windUnit === "kph" || raw.windUnit === "scale" ? raw.windUnit : defaultSettings.windUnit,
    timezonePolicy:
      raw.timezonePolicy === "device" || raw.timezonePolicy === "location"
        ? raw.timezonePolicy
        : defaultSettings.timezonePolicy,
    reducedMotion: typeof raw.reducedMotion === "boolean" ? raw.reducedMotion : null,
    workspaceDefaultGroup:
      raw.workspaceDefaultGroup === "favorites" ||
      raw.workspaceDefaultGroup === "recent" ||
      raw.workspaceDefaultGroup === "all"
        ? raw.workspaceDefaultGroup
        : defaultSettings.workspaceDefaultGroup,
  };
};

export const useSettingsStore = defineStore("settings", () => {
  const temperatureUnit = shallowRef<TemperatureUnit>(defaultSettings.temperatureUnit);
  const windUnit = shallowRef<WindUnit>(defaultSettings.windUnit);
  const timezonePolicy = shallowRef<TimezonePolicy>(defaultSettings.timezonePolicy);
  const reducedMotion = shallowRef<boolean | null>(defaultSettings.reducedMotion);
  const workspaceDefaultGroup = shallowRef<WorkspaceDefaultGroup>(defaultSettings.workspaceDefaultGroup);
  const hasHydrated = shallowRef(false);

  const snapshot = (): PlatformSettings => ({
    temperatureUnit: temperatureUnit.value,
    windUnit: windUnit.value,
    timezonePolicy: timezonePolicy.value,
    reducedMotion: reducedMotion.value,
    workspaceDefaultGroup: workspaceDefaultGroup.value,
  });

  const applySettings = (nextSettings: PlatformSettings): void => {
    temperatureUnit.value = nextSettings.temperatureUnit;
    windUnit.value = nextSettings.windUnit;
    timezonePolicy.value = nextSettings.timezonePolicy;
    reducedMotion.value = nextSettings.reducedMotion;
    workspaceDefaultGroup.value = nextSettings.workspaceDefaultGroup;
  };

  const persist = (): void => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
  };

  const hydrate = (): PlatformSettings => {
    if (hasHydrated.value || typeof window === "undefined") {
      return snapshot();
    }

    hasHydrated.value = true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      applySettings(defaultSettings);
      return snapshot();
    }

    try {
      applySettings(normalizeSettings(JSON.parse(raw)));
    } catch {
      applySettings(defaultSettings);
    }

    return snapshot();
  };

  const updateSettings = (patch: Partial<PlatformSettings>): PlatformSettings => {
    const nextSettings = normalizeSettings({
      ...snapshot(),
      ...patch,
    });
    applySettings(nextSettings);
    persist();
    return nextSettings;
  };

  return {
    temperatureUnit,
    windUnit,
    timezonePolicy,
    reducedMotion,
    workspaceDefaultGroup,
    hasHydrated,
    hydrate,
    updateSettings,
    snapshot,
  };
});
