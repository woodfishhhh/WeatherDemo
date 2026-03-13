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

export interface AirQualityState {
  status: "available" | "unavailable";
  data: AirQualitySnapshot | null;
  reason?: string;
}

export interface CityWeatherBundle {
  location: LocationRecord;
  current: CurrentConditions | null;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  airQuality: AirQualityState;
}

export interface SavedCityWeatherSummary {
  temperature: string;
  text: string;
  textBilingual: BilingualText;
  icon: string;
  humidity: string;
  windScale: string;
  province: string;
}
