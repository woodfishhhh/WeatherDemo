export interface LocationRecord {
  id: string;
  name: string;
  province: string;
  district?: string;
  country?: string;
  countryCode?: string;
  latitude: string;
  longitude: string;
  timezone?: string;
  adcode?: string;
}

export interface BilingualText {
  en: string;
  zh: string;
}

export interface CurrentConditions {
  observationTime: string;
  temperature: string;
  feelsLike: string;
  text: string;
  textBilingual: BilingualText;
  icon: string;
  humidity: string;
  windDirection: string;
  windScale: string;
  windSpeed: string;
  pressure: string;
  visibility: string;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: string;
  text: string;
  textBilingual: BilingualText;
  icon: string;
  pop: string;
  windDirection: string;
  windScale: string;
}

export interface DailyForecastPoint {
  date: string;
  tempMax: string;
  tempMin: string;
  textDay: string;
  textDayBilingual: BilingualText;
  textNight: string;
  textNightBilingual: BilingualText;
  iconDay: string;
  iconNight: string;
  windDirectionDay: string;
  windScaleDay: string;
  humidity: string;
  precip: string;
  sunrise?: string;
  sunset?: string;
  uvIndex?: string;
}

export interface AirQualitySnapshot {
  aqi: string;
  category: string;
  primary: string;
  pollutants: Array<{
    label: string;
    value: string;
  }>;
}

export type ProviderDatasetState<T> =
  | {
      status: "available";
      data: T;
    }
  | {
      status: "unavailable";
      data: null;
      reason: string;
    };

export type AirQualityState = ProviderDatasetState<AirQualitySnapshot>;

export interface HistoricalTrendPoint {
  date: string;
  temperatureMax: string;
  temperatureMin: string;
  precipitation: string;
  humidity: string;
  windSpeed: string;
  text: string;
  textBilingual: BilingualText;
  icon: string;
}

export interface CityWeatherBundle {
  location: LocationRecord;
  current: CurrentConditions | null;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  airQuality: AirQualityState;
}

export type HistoricalTrendState = ProviderDatasetState<HistoricalTrendPoint[]>;

export interface SavedCityWeatherSummary {
  temperature: string;
  text: string;
  textBilingual: BilingualText;
  icon: string;
  humidity: string;
  windScale: string;
  windSpeed: string;
  province: string;
}

export type WeatherIntelligenceCardId =
  | "precipitation-risk"
  | "temperature-swing"
  | "daylight-window"
  | "comfort-severity"
  | "weather-watch";

export type WeatherIntelligenceSeverity = "low" | "moderate" | "high";

export interface WeatherIntelligenceCard {
  id: WeatherIntelligenceCardId;
  label: string;
  headline: string;
  summary: string;
  detail: string;
  severity: WeatherIntelligenceSeverity;
  status: "available" | "unavailable";
}

export interface CityWeatherIntelligence {
  cards: WeatherIntelligenceCard[];
}
