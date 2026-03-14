import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
  useSettingsStore,
  type TemperatureUnit,
  type TimezonePolicy,
  type WindUnit,
  type WorkspaceDefaultGroup,
} from "@/features/settings/stores/settings";
import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";

type SelectOption = {
  value: string;
  label: string;
  description: string;
};

const temperatureOptions: SelectOption[] = [
  {
    value: "celsius",
    label: "Celsius / 摄氏",
    description: "Keep provider-native Celsius labels on the platform surface.",
  },
  {
    value: "fahrenheit",
    label: "Fahrenheit / 华氏",
    description: "Convert visible weather temperatures into Fahrenheit on supported views.",
  },
];

const windOptions: SelectOption[] = [
  {
    value: "scale",
    label: "Scale / 风力",
    description: "Use the compact wind scale language already present in the current UI.",
  },
  {
    value: "kph",
    label: "km/h / 公里每小时",
    description: "Render wind using measured speed when the upstream dataset provides it.",
  },
];

const timezoneOptions: SelectOption[] = [
  {
    value: "location",
    label: "Location / 城市时区",
    description: "Observation and forecast times follow the city being viewed.",
  },
  {
    value: "device",
    label: "Device / 设备时区",
    description: "Observation and forecast times follow the user device timezone.",
  },
];

const reducedMotionOptions: SelectOption[] = [
  {
    value: "system",
    label: "System / 跟随系统",
    description: "Respect the browser reduced-motion preference without forcing extra motion.",
  },
  {
    value: "on",
    label: "On / 开启",
    description: "Always reduce optional motion on top of the browser preference.",
  },
  {
    value: "off",
    label: "Off / 关闭",
    description: "Allow full motion only when the browser itself is not requesting reduced motion.",
  },
];

const workspaceGroupOptions: SelectOption[] = [
  {
    value: "all",
    label: "All / 全部",
    description: "Open the workspace on the full saved-city lane by default.",
  },
  {
    value: "favorites",
    label: "Favorites / 关注",
    description: "Start the workspace on the cities you have explicitly pinned.",
  },
  {
    value: "recent",
    label: "Recent / 最近",
    description: "Start the workspace on the cities you opened most recently.",
  },
];

export const useSettingsDashboard = () => {
  const settingsStore = useSettingsStore();
  settingsStore.hydrate();

  const { formatDateTime, formatTemperature, formatWind } = useWeatherDisplayPreferences();
  const {
    hasHydrated,
    reducedMotion,
    temperatureUnit,
    timezonePolicy,
    windUnit,
    workspaceDefaultGroup,
  } = storeToRefs(settingsStore);

  const updateTemperatureUnit = (value: string): void => {
    settingsStore.updateSettings({
      temperatureUnit: value === "fahrenheit" ? "fahrenheit" : "celsius",
    });
  };

  const updateWindUnit = (value: string): void => {
    settingsStore.updateSettings({
      windUnit: value === "kph" ? "kph" : "scale",
    });
  };

  const updateTimezonePolicy = (value: string): void => {
    settingsStore.updateSettings({
      timezonePolicy: value === "device" ? "device" : "location",
    });
  };

  const updateReducedMotion = (value: string): void => {
    settingsStore.updateSettings({
      reducedMotion: value === "system" ? null : value === "on",
    });
  };

  const updateWorkspaceDefaultGroup = (value: string): void => {
    const nextGroup: WorkspaceDefaultGroup =
      value === "favorites" || value === "recent" ? value : "all";
    settingsStore.updateSettings({
      workspaceDefaultGroup: nextGroup,
    });
  };

  const reducedMotionSelection = computed(() => {
    if (reducedMotion.value === true) {
      return "on";
    }

    if (reducedMotion.value === false) {
      return "off";
    }

    return "system";
  });

  const previewTemperature = computed(() => formatTemperature("23"));
  const previewWind = computed(() => formatWind({ speed: "12", scale: "3" }));
  const previewTime = computed(() =>
    formatDateTime(
      "2026-03-14T08:00+08:00",
      {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
      "Asia/Shanghai"
    )
  );

  const reducedMotionLabel = computed(() => {
    if (reducedMotion.value === true) {
      return "Reduced motion is forced on top of the browser setting.";
    }

    if (reducedMotion.value === false) {
      return "Full motion is allowed unless the browser explicitly asks for reduced motion.";
    }

    return "Motion follows the browser preference by default.";
  });

  return {
    hasHydrated,
    previewTemperature,
    previewTime,
    previewWind,
    reducedMotionLabel,
    reducedMotionOptions,
    reducedMotionSelection,
    temperatureOptions,
    temperatureUnit: computed(() => temperatureUnit.value as TemperatureUnit),
    timezoneOptions,
    timezonePolicy: computed(() => timezonePolicy.value as TimezonePolicy),
    updateReducedMotion,
    updateTemperatureUnit,
    updateTimezonePolicy,
    updateWindUnit,
    updateWorkspaceDefaultGroup,
    windOptions,
    windUnit: computed(() => windUnit.value as WindUnit),
    workspaceDefaultGroup: computed(() => workspaceDefaultGroup.value),
    workspaceGroupOptions,
  };
};
