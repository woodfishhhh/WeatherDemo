import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
  useSettingsStore,
  type TemperatureUnit,
  type TimezonePolicy,
  type WindUnit,
  type TimeFormat,
  type PressureUnit,
  type VisibilityUnit,
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
  if (unit === "kph" || unit === "mph") {
    const speed = parseNumeric(input.speed);
    if (speed !== null) {
      if (unit === "mph") {
        return `${Math.round(speed * 0.621371)} mph`;
      }
      return `${Math.round(speed)} km/h`;
    }
  }

  return input.scale ? `Scale ${input.scale}` : "--";
};

export const formatDateWithTimezonePolicy = (
  value: string | undefined,
  options: DateFormatOptions,
  timezonePolicy: TimezonePolicy,
  timeFormat: TimeFormat,
  locationTimezone?: string
): string => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const is12Hour = timeFormat === "12h";

  return new Intl.DateTimeFormat("zh-CN", {
    ...options,
    hour12: options.hour12 !== undefined ? options.hour12 : is12Hour,
    timeZone: timezonePolicy === "location" ? locationTimezone : undefined,
  }).format(date);
};

export const formatPressureValue = (value: string | undefined, unit: PressureUnit): string => {
  const parsed = parseNumeric(value);
  if (parsed === null) {
    return "--";
  }
  if (unit === "inHg") {
    return `${(parsed * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(parsed)} hPa`;
};

export const formatVisibilityValue = (value: string | undefined, unit: VisibilityUnit): string => {
  const parsed = parseNumeric(value);
  if (parsed === null) {
    return "--";
  }
  if (unit === "mi") {
    return `${(parsed * 0.621371).toFixed(1)} mi`;
  }
  return `${Math.round(parsed)} km`;
};

export const useWeatherDisplayPreferences = () => {
  const settingsStore = useSettingsStore();
  const { temperatureUnit, timezonePolicy, windUnit, timeFormat, pressureUnit, visibilityUnit } = storeToRefs(settingsStore);

  return {
    temperatureUnit: computed(() => temperatureUnit.value),
    timezonePolicy: computed(() => timezonePolicy.value),
    windUnit: computed(() => windUnit.value),
    timeFormat: computed(() => timeFormat.value),
    pressureUnit: computed(() => pressureUnit.value),
    visibilityUnit: computed(() => visibilityUnit.value),
    formatTemperature: (value: string | undefined): string =>
      formatTemperatureValue(value, temperatureUnit.value),
    formatWind: (input: WindDisplayInput): string => formatWindValue(input, windUnit.value),
    formatPressure: (value: string | undefined): string => formatPressureValue(value, pressureUnit.value),
    formatVisibility: (value: string | undefined): string => formatVisibilityValue(value, visibilityUnit.value),
    formatDateTime: (
      value: string | undefined,
      options: DateFormatOptions,
      locationTimezone?: string
    ): string => formatDateWithTimezonePolicy(value, options, timezonePolicy.value, timeFormat.value, locationTimezone),
  };
};
