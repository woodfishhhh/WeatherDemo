import type {
  AirQualitySnapshot,
  BilingualText,
  CurrentConditions,
  DailyForecastPoint,
  HistoricalTrendPoint,
  HourlyForecastPoint,
  LocationRecord,
} from "@/features/weather/types";
import { createAdapterError, type QWeatherLocation } from "./qweather.transport";

const WEATHER_TEXT_BY_ICON: Record<string, BilingualText> = {
  "100": { en: "Sunny", zh: "晴" },
  "101": { en: "Few Clouds", zh: "多云" },
  "102": { en: "Partly Cloudy", zh: "少云" },
  "103": { en: "Partly Cloudy", zh: "晴间多云" },
  "104": { en: "Overcast", zh: "阴" },
  "150": { en: "Clear", zh: "晴" },
  "151": { en: "Few Clouds", zh: "多云" },
  "152": { en: "Partly Cloudy", zh: "少云" },
  "153": { en: "Partly Cloudy", zh: "晴间多云" },
  "154": { en: "Overcast", zh: "阴" },
  "300": { en: "Shower Rain", zh: "阵雨" },
  "301": { en: "Strong Shower Rain", zh: "强阵雨" },
  "302": { en: "Thunder Shower", zh: "雷阵雨" },
  "303": { en: "Severe Thunderstorm", zh: "强雷阵雨" },
  "304": { en: "Thunderstorm with Hail", zh: "雷阵雨伴冰雹" },
  "305": { en: "Light Rain", zh: "小雨" },
  "306": { en: "Moderate Rain", zh: "中雨" },
  "307": { en: "Heavy Rain", zh: "大雨" },
  "308": { en: "Extreme Rain", zh: "极端降雨" },
  "309": { en: "Drizzle", zh: "毛毛雨" },
  "310": { en: "Storm", zh: "暴雨" },
  "311": { en: "Heavy Storm", zh: "大暴雨" },
  "312": { en: "Severe Storm", zh: "特大暴雨" },
  "313": { en: "Freezing Rain", zh: "冻雨" },
  "314": { en: "Light to Moderate Rain", zh: "小到中雨" },
  "315": { en: "Moderate to Heavy Rain", zh: "中到大雨" },
  "316": { en: "Heavy to Storm", zh: "大到暴雨" },
  "317": { en: "Storm to Heavy Storm", zh: "暴雨到大暴雨" },
  "318": { en: "Heavy to Severe Storm", zh: "大暴雨到特大暴雨" },
  "399": { en: "Rain", zh: "雨" },
  "400": { en: "Light Snow", zh: "小雪" },
  "401": { en: "Moderate Snow", zh: "中雪" },
  "402": { en: "Heavy Snow", zh: "大雪" },
  "403": { en: "Blizzard", zh: "暴雪" },
  "404": { en: "Sleet", zh: "雨夹雪" },
  "405": { en: "Rain and Snow", zh: "雨雪天气" },
  "406": { en: "Shower Snow", zh: "阵雨夹雪" },
  "407": { en: "Snow Flurry", zh: "阵雪" },
  "408": { en: "Moderate to Heavy Snow", zh: "中到大雪" },
  "409": { en: "Heavy Snow to Blizzard", zh: "大到暴雪" },
  "410": { en: "Snow", zh: "雪" },
  "456": { en: "Shower Snow", zh: "阵雨夹雪" },
  "457": { en: "Snow Showers", zh: "阵雪" },
  "499": { en: "Snow", zh: "雪" },
  "500": { en: "Mist", zh: "薄雾" },
  "501": { en: "Fog", zh: "雾" },
  "502": { en: "Haze", zh: "霾" },
  "503": { en: "Sand", zh: "扬沙" },
  "504": { en: "Dust", zh: "浮尘" },
  "507": { en: "Duststorm", zh: "沙尘暴" },
  "508": { en: "Sandstorm", zh: "强沙尘暴" },
  "509": { en: "Dense Fog", zh: "浓雾" },
  "510": { en: "Strong Fog", zh: "强浓雾" },
  "511": { en: "Moderate Haze", zh: "中度霾" },
  "512": { en: "Heavy Haze", zh: "重度霾" },
  "513": { en: "Severe Haze", zh: "严重霾" },
  "514": { en: "Dense Fog", zh: "大雾" },
  "515": { en: "Strong Dense Fog", zh: "特强浓雾" },
  "800": { en: "Hot", zh: "热" },
  "801": { en: "Cold", zh: "冷" },
  "802": { en: "Windy", zh: "风" },
  "803": { en: "Gale", zh: "大风" },
  "804": { en: "Hurricane", zh: "飓风" },
  "805": { en: "Rain and Hail", zh: "雨夹冰雹" },
  "806": { en: "Hail", zh: "冰雹" },
  "807": { en: "Thunderstorm", zh: "雷暴" },
  "900": { en: "Unknown", zh: "未知" },
  "999": { en: "Unknown", zh: "未知" },
};

const WEATHER_TEXT_FALLBACKS: Array<{ matcher: RegExp; text: BilingualText }> = [
  { matcher: /雷阵雨伴冰雹/, text: { en: "Thunderstorm with Hail", zh: "雷阵雨伴冰雹" } },
  { matcher: /强雷阵雨/, text: { en: "Severe Thunderstorm", zh: "强雷阵雨" } },
  { matcher: /雷阵雨|雷暴/, text: { en: "Thunder Shower", zh: "雷阵雨" } },
  { matcher: /特大暴雨/, text: { en: "Severe Storm", zh: "特大暴雨" } },
  { matcher: /大暴雨/, text: { en: "Heavy Storm", zh: "大暴雨" } },
  { matcher: /暴雨/, text: { en: "Storm", zh: "暴雨" } },
  { matcher: /大雨/, text: { en: "Heavy Rain", zh: "大雨" } },
  { matcher: /中雨/, text: { en: "Moderate Rain", zh: "中雨" } },
  { matcher: /小雨|阵雨|毛毛雨/, text: { en: "Light Rain", zh: "小雨" } },
  { matcher: /冻雨/, text: { en: "Freezing Rain", zh: "冻雨" } },
  { matcher: /暴雪/, text: { en: "Blizzard", zh: "暴雪" } },
  { matcher: /大雪/, text: { en: "Heavy Snow", zh: "大雪" } },
  { matcher: /中雪/, text: { en: "Moderate Snow", zh: "中雪" } },
  { matcher: /小雪|阵雪/, text: { en: "Light Snow", zh: "小雪" } },
  { matcher: /雨夹雪|雨雪/, text: { en: "Sleet", zh: "雨夹雪" } },
  { matcher: /扬沙|浮尘/, text: { en: "Dust", zh: "浮尘" } },
  { matcher: /沙尘暴/, text: { en: "Sandstorm", zh: "沙尘暴" } },
  { matcher: /特强浓雾|强浓雾|浓雾|大雾|雾/, text: { en: "Fog", zh: "雾" } },
  { matcher: /霾/, text: { en: "Haze", zh: "霾" } },
  { matcher: /多云|少云|晴间多云/, text: { en: "Partly Cloudy", zh: "多云" } },
  { matcher: /^阴$/, text: { en: "Overcast", zh: "阴" } },
  { matcher: /晴/, text: { en: "Sunny", zh: "晴" } },
  { matcher: /热/, text: { en: "Hot", zh: "热" } },
  { matcher: /冷/, text: { en: "Cold", zh: "冷" } },
  { matcher: /飓风/, text: { en: "Hurricane", zh: "飓风" } },
  { matcher: /风/, text: { en: "Windy", zh: "风" } },
];

export const toBilingualWeatherText = (text?: string, icon?: string): BilingualText => {
  const normalizedText = text?.trim();

  if (icon && WEATHER_TEXT_BY_ICON[icon]) {
    return {
      en: WEATHER_TEXT_BY_ICON[icon].en,
      zh: normalizedText || WEATHER_TEXT_BY_ICON[icon].zh,
    };
  }

  if (normalizedText) {
    const fallback = WEATHER_TEXT_FALLBACKS.find(({ matcher }) => matcher.test(normalizedText));
    if (fallback) {
      return {
        en: fallback.text.en,
        zh: normalizedText,
      };
    }

    if (Array.from(normalizedText).every((char) => char.charCodeAt(0) <= 0x7f)) {
      return {
        en: normalizedText,
        zh: "天气",
      };
    }

    return {
      en: "Weather",
      zh: normalizedText,
    };
  }

  return {
    en: "Unknown",
    zh: "未知",
  };
};

export const normalizeLocation = (item: QWeatherLocation): LocationRecord | null => {
  if (!item.id || !item.name || !item.adm1 || !item.lat || !item.lon) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    province: item.adm1,
    district: item.adm2,
    country: item.country,
    countryCode: item.countryCode,
    latitude: item.lat,
    longitude: item.lon,
    timezone: item.tz,
    adcode: item.adcode,
  };
};

export const normalizeCurrent = (payload?: Record<string, string>): CurrentConditions | null => {
  if (!payload?.temp || !payload.text || !payload.icon) {
    throw createAdapterError("current", "invalid-payload", "QWeather current weather payload is missing required fields.");
  }

  const textBilingual = toBilingualWeatherText(payload.text, payload.icon);

  return {
    observationTime: payload.obsTime ?? "",
    temperature: payload.temp,
    feelsLike: payload.feelsLike ?? payload.temp,
    text: payload.text,
    textBilingual,
    icon: payload.icon,
    humidity: payload.humidity ?? "--",
    windDirection: payload.windDir ?? "--",
    windScale: payload.windScale ?? "--",
    windSpeed: payload.windSpeed ?? "--",
    pressure: payload.pressure ?? "--",
    visibility: payload.vis ?? "--",
  };
};

export const normalizeHourly = (items?: Array<Record<string, string>>): HourlyForecastPoint[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createAdapterError("hourly", "invalid-payload", "QWeather hourly forecast payload is missing hourly points.");
  }

  const normalized = items
    .filter((item) => item.fxTime && item.temp && item.text && item.icon)
    .map((item) => ({
      time: item.fxTime ?? "",
      temperature: item.temp ?? "--",
      text: item.text ?? "--",
      textBilingual: toBilingualWeatherText(item.text, item.icon),
      icon: item.icon ?? "999",
      pop: item.pop ?? "0",
      windDirection: item.windDir ?? "--",
      windScale: item.windScale ?? "--",
    }));

  if (!normalized.length) {
    throw createAdapterError(
      "hourly",
      "invalid-payload",
      "QWeather hourly forecast payload does not contain usable forecast points."
    );
  }

  return normalized;
};

export const normalizeDaily = (items?: Array<Record<string, string>>): DailyForecastPoint[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createAdapterError("daily", "invalid-payload", "QWeather daily forecast payload is missing forecast rows.");
  }

  const normalized = items
    .filter((item) => item.fxDate && item.tempMax && item.tempMin)
    .map((item) => {
      const iconDay = item.iconDay ?? "999";
      const iconNight = item.iconNight ?? "999";

      return {
        date: item.fxDate ?? "",
        tempMax: item.tempMax ?? "--",
        tempMin: item.tempMin ?? "--",
        textDay: item.textDay ?? "--",
        textDayBilingual: toBilingualWeatherText(item.textDay, iconDay),
        textNight: item.textNight ?? "--",
        textNightBilingual: toBilingualWeatherText(item.textNight, iconNight),
        iconDay,
        iconNight,
        windDirectionDay: item.windDirDay ?? "--",
        windScaleDay: item.windScaleDay ?? "--",
        humidity: item.humidity ?? "--",
        precip: item.precip ?? "0",
        sunrise: item.sunrise,
        sunset: item.sunset,
        uvIndex: item.uvIndex,
      };
    });

  if (!normalized.length) {
    throw createAdapterError("daily", "invalid-payload", "QWeather daily forecast payload does not contain usable forecast rows.");
  }

  return normalized;
};

export const normalizeAirQuality = (payload?: Record<string, string>): AirQualitySnapshot => {
  if (!payload?.aqi || !payload.category) {
    throw createAdapterError("air-quality", "invalid-payload", "QWeather air quality payload is missing required fields.");
  }

  return {
    aqi: payload.aqi,
    category: payload.category,
    primary: payload.primary ?? "--",
    pollutants: [
      { label: "PM2.5", value: payload.pm2p5 ?? "--" },
      { label: "PM10", value: payload.pm10 ?? "--" },
      { label: "NO2", value: payload.no2 ?? "--" },
      { label: "SO2", value: payload.so2 ?? "--" },
      { label: "CO", value: payload.co ?? "--" },
      { label: "O3", value: payload.o3 ?? "--" },
    ],
  };
};

const toNumberList = (items: Array<Record<string, string>>, field: string): number[] =>
  items
    .map((item) => Number(item[field]))
    .filter((value) => Number.isFinite(value));

const formatNumber = (value: number | undefined, digits = 0): string => {
  if (value === undefined) {
    return "--";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
};

const sumValues = (values: number[]): number | undefined =>
  values.length ? values.reduce((total, value) => total + value, 0) : undefined;

const averageValues = (values: number[]): number | undefined =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : undefined;

export const normalizeHistoricalTrendPoint = (
  fallbackDate: string,
  dailyPayload?: Record<string, string>,
  hourlyPayload: Array<Record<string, string>> = []
): HistoricalTrendPoint => {
  const hourlyTemperatures = toNumberList(hourlyPayload, "temp");
  const hourlyHumidity = toNumberList(hourlyPayload, "humidity");
  const hourlyWindSpeed = toNumberList(hourlyPayload, "windSpeed");
  const hourlyPrecipitation = toNumberList(hourlyPayload, "precip");
  const icon = dailyPayload?.iconDay ?? hourlyPayload[0]?.icon ?? "999";
  const text = dailyPayload?.textDay ?? hourlyPayload[0]?.text ?? "--";

  const temperatureMax =
    dailyPayload?.tempMax ??
    (hourlyTemperatures.length ? formatNumber(Math.max(...hourlyTemperatures)) : "--");
  const temperatureMin =
    dailyPayload?.tempMin ??
    (hourlyTemperatures.length ? formatNumber(Math.min(...hourlyTemperatures)) : "--");
  const humidity = dailyPayload?.humidity ?? formatNumber(averageValues(hourlyHumidity));
  const precipitation = dailyPayload?.precip ?? formatNumber(sumValues(hourlyPrecipitation), 1);
  const windSpeed =
    dailyPayload?.windSpeedDay ??
    dailyPayload?.windSpeedMax ??
    formatNumber(hourlyWindSpeed.length ? Math.max(...hourlyWindSpeed) : undefined);

  if (temperatureMax === "--" || temperatureMin === "--") {
    throw createAdapterError(
      "historical-trends",
      "invalid-payload",
      "QWeather historical weather payload is missing temperature data."
    );
  }

  return {
    date: dailyPayload?.fxDate ?? fallbackDate,
    temperatureMax,
    temperatureMin,
    precipitation,
    humidity,
    windSpeed,
    text,
    textBilingual: toBilingualWeatherText(text, icon),
    icon,
  };
};
