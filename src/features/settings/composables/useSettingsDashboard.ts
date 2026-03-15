import { computed } from "vue";
import { storeToRefs } from "pinia";
import {
  useSettingsStore,
  type TemperatureUnit,
  type TimezonePolicy,
  type WindUnit,
  type WorkspaceDefaultGroup,
  type TimeFormat,
  type PressureUnit,
  type VisibilityUnit,
} from "@/features/settings/stores/settings";
import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";

type SelectOption = {
  value: string;
  label: string;
  descriptionEn: string;
  descriptionZh: string;
};

const temperatureOptions: SelectOption[] = [
  { value: "celsius", label: "°C / 摄氏", descriptionEn: "Keep provider-native Celsius labels on the platform surface.", descriptionZh: "在面板上保持数据源原生的摄氏度单位。" },
  { value: "fahrenheit", label: "°F / 华氏", descriptionEn: "Convert visible weather temperatures into Fahrenheit on supported views.", descriptionZh: "在支持的视图上将气温粗略地转换为华氏度展现。" },
];

const windOptions: SelectOption[] = [
  { value: "scale", label: "Scale / 风级", descriptionEn: "Use the compact wind scale language already present in the current UI.", descriptionZh: "使用应用当前界面原有的紧凑风力等级文字。" },
  { value: "kph", label: "km/h / 公里时", descriptionEn: "Render wind using measured speed in km/h when provided.", descriptionZh: "展示并使用每小时公里(km/h)的风速标准。" },
  { value: "mph", label: "mph / 英里时", descriptionEn: "Render wind using measured speed in mph when provided.", descriptionZh: "展示并使用每小时英里(mph)的风速标准。" },
];

const timezoneOptions: SelectOption[] = [
  { value: "location", label: "Location / 城市", descriptionEn: "Observation and forecast times follow the city being viewed.", descriptionZh: "页面上的天气观测与预报时间跟随当地城市时区。" },
  { value: "device", label: "Device / 设备", descriptionEn: "Observation and forecast times follow the user device timezone.", descriptionZh: "强制将所有天气信息的时间轴转换为当前设备时区。" },
];

const timeFormatOptions: SelectOption[] = [
  { value: "24h", label: "24h / 24小时", descriptionEn: "Display time using a standard 24-hour clock.", descriptionZh: "腕表界面使用标准的24小时制显示时间。" },
  { value: "12h", label: "12h / 12小时", descriptionEn: "Display time using a 12-hour clock with AM/PM indicators.", descriptionZh: "腕表界面使用携带上下午标识的12小时制显示时间。" },
];

const pressureOptions: SelectOption[] = [
  { value: "hPa", label: "hPa / 百帕", descriptionEn: "Standard atmospheric pressure measurement unit.", descriptionZh: "使用标准气压计量单位百帕(hPa)。" },
  { value: "inHg", label: "inHg / 英寸汞", descriptionEn: "Barometric pressure displayed in inches of mercury.", descriptionZh: "使用美制英制气压计量单位英寸汞(inHg)。" },
];

const visibilityOptions: SelectOption[] = [
  { value: "km", label: "km / 公里", descriptionEn: "Measure visual range and distance using kilometers.", descriptionZh: "使用公里(km)计量并展示能见度距离。" },
  { value: "mi", label: "mi / 英里", descriptionEn: "Measure visual range and distance using miles.", descriptionZh: "使用英里(mi)计量并展示能见度距离。" },
];

const reducedMotionOptions: SelectOption[] = [
  { value: "system", label: "System / 系统跟随", descriptionEn: "Respect the browser reduced-motion preference without forcing extra motion.", descriptionZh: "尊重系统的减弱动效偏好，不强制添加任何不必要的动画。" },
  { value: "on", label: "On / 减弱动效", descriptionEn: "Always reduce optional motion on top of the browser preference.", descriptionZh: "在所有天气面板中完全减少可选动效，更关注信息。" },
  { value: "off", label: "Off / 完整体验", descriptionEn: "Allow full motion only when the browser itself is not requesting reduced motion.", descriptionZh: "在系统不限制的前提下，允许面板加载所有过渡完整体验。" },
];

const workspaceGroupOptions: SelectOption[] = [
  { value: "all", label: "All / 全部", descriptionEn: "Open the workspace on the full saved-city lane by default.", descriptionZh: "启动平台主页时，默认展示所有已保存的天气卡片。" },
  { value: "favorites", label: "Favs / 关注", descriptionEn: "Start the workspace on the cities you have explicitly pinned.", descriptionZh: "启动平台主页时，优先展示拥有明确关注标识的卡片。" },
  { value: "recent", label: "Recent / 最近", descriptionEn: "Start the workspace on the cities you opened most recently.", descriptionZh: "启动平台主页时，优先展示最近查看过详情的城市卡片。" },
];

export const useSettingsDashboard = () => {
  const settingsStore = useSettingsStore();
  const { formatDateTime, formatTemperature, formatWind, formatPressure, formatVisibility } = useWeatherDisplayPreferences();
  const {
    hasHydrated,
    reducedMotion,
    temperatureUnit,
    timezonePolicy,
    windUnit,
    workspaceDefaultGroup,
    timeFormat,
    pressureUnit,
    visibilityUnit,
  } = storeToRefs(settingsStore);

  const updateTemperatureUnit = (value: string): void => {
    settingsStore.updateSettings({ temperatureUnit: value as TemperatureUnit });
  };

  const updateWindUnit = (value: string): void => {
    settingsStore.updateSettings({ windUnit: value as WindUnit });
  };

  const updateTimezonePolicy = (value: string): void => {
    settingsStore.updateSettings({ timezonePolicy: value as TimezonePolicy });
  };

  const updateTimeFormat = (value: string): void => {
    settingsStore.updateSettings({ timeFormat: value as TimeFormat });
  };

  const updatePressureUnit = (value: string): void => {
    settingsStore.updateSettings({ pressureUnit: value as PressureUnit });
  };

  const updateVisibilityUnit = (value: string): void => {
    settingsStore.updateSettings({ visibilityUnit: value as VisibilityUnit });
  };

  const updateReducedMotion = (value: string): void => {
    settingsStore.updateSettings({
      reducedMotion: value === "system" ? null : value === "on",
    });
  };

  const updateWorkspaceDefaultGroup = (value: string): void => {
    settingsStore.updateSettings({ workspaceDefaultGroup: value as WorkspaceDefaultGroup });
  };

  const reducedMotionSelection = computed(() => {
    if (reducedMotion.value === true) return "on";
    if (reducedMotion.value === false) return "off";
    return "system";
  });

  const previewTemperature = computed(() => formatTemperature("23"));
  const previewWind = computed(() => formatWind({ speed: "15", scale: "3" }));
  const previewPressure = computed(() => formatPressure("1013"));
  const previewVisibility = computed(() => formatVisibility("10"));
  const previewTime = computed(() =>
    formatDateTime(
      "2026-03-14T18:00+08:00",
      { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" },
      "Asia/Shanghai"
    )
  );

  const reducedMotionLabel = computed(() => {
    if (reducedMotion.value === true) return "Reduced motion is forced on top of the browser setting.";
    if (reducedMotion.value === false) return "Full motion is allowed unless the browser explicitly asks for reduced motion.";
    return "Motion follows the browser preference by default.";
  });

  return {
    hasHydrated,
    previewTemperature,
    previewWind,
    previewPressure,
    previewVisibility,
    previewTime,
    reducedMotionLabel,
    
    reducedMotionOptions,
    reducedMotionSelection,
    updateReducedMotion,
    
    temperatureOptions,
    temperatureUnit: computed(() => temperatureUnit.value),
    updateTemperatureUnit,
    
    timezoneOptions,
    timezonePolicy: computed(() => timezonePolicy.value),
    updateTimezonePolicy,
    
    windOptions,
    windUnit: computed(() => windUnit.value),
    updateWindUnit,
    
    timeFormatOptions,
    timeFormat: computed(() => timeFormat.value),
    updateTimeFormat,

    pressureOptions,
    pressureUnit: computed(() => pressureUnit.value),
    updatePressureUnit,

    visibilityOptions,
    visibilityUnit: computed(() => visibilityUnit.value),
    updateVisibilityUnit,

    workspaceDefaultGroup: computed(() => workspaceDefaultGroup.value),
    workspaceGroupOptions,
    updateWorkspaceDefaultGroup,
  };
};
