import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
  useSettingsStore,
  type TemperatureUnit,
  type TimezonePolicy,
  type WindUnit,
} from "@/features/settings/stores/settings";

type WindDisplayInput = {
  speed?: string;
  scale?: string;
};

type DateFormatOptions = Intl.DateTimeFormatOptions;

export const resolveReducedMotionPreference = ({
  reducedMotion,
  systemPrefersReducedMotion,
}: {
  reducedMotion: boolean | null;
  systemPrefersReducedMotion: boolean;
}): boolean => systemPrefersReducedMotion || reducedMotion === true;

const parseNumeric = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatTemperatureValue = (value: string | undefined, unit: TemperatureUnit): string => {
  const parsed = parseNumeric(value);
  if (parsed === null) {
    return "--";
  }

  if (unit === "fahrenheit") {
    return `${Math.round((parsed * 9) / 5 + 32)}°F`;
  }

  return `${Math.round(parsed)}°C`;
};

export const formatWindValue = (input: WindDisplayInput, unit: WindUnit): string => {
  if (unit === "kph") {
    const speed = parseNumeric(input.speed);
    if (speed !== null) {
      return `${Math.round(speed)} km/h`;
    }
  }

  return input.scale ? `Scale ${input.scale}` : "--";
};

export const formatDateWithTimezonePolicy = (
  value: string | undefined,
  options: DateFormatOptions,
  timezonePolicy: TimezonePolicy,
  locationTimezone?: string
): string => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    ...options,
    timeZone: timezonePolicy === "location" ? locationTimezone : undefined,
  }).format(date);
};

export const useWeatherDisplayPreferences = () => {
  const settingsStore = useSettingsStore();
  const { temperatureUnit, timezonePolicy, windUnit } = storeToRefs(settingsStore);

  return {
    temperatureUnit: computed(() => temperatureUnit.value),
    timezonePolicy: computed(() => timezonePolicy.value),
    windUnit: computed(() => windUnit.value),
    formatTemperature: (value: string | undefined): string =>
      formatTemperatureValue(value, temperatureUnit.value),
    formatWind: (input: WindDisplayInput): string => formatWindValue(input, windUnit.value),
    formatDateTime: (
      value: string | undefined,
      options: DateFormatOptions,
      locationTimezone?: string
    ): string => formatDateWithTimezonePolicy(value, options, timezonePolicy.value, locationTimezone),
  };
};
