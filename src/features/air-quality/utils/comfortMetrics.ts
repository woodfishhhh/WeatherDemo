import type { CityWeatherBundle } from "@/features/weather/types";

export type ComfortMetric = {
  id: "feels-like" | "visibility" | "pressure" | "uv-index" | "daylight";
  label: string;
  value: string;
  detail: string;
  status: "available" | "unavailable";
};

const unavailableMetric = (id: ComfortMetric["id"], label: string, detail: string): ComfortMetric => ({
  id,
  label,
  value: "--",
  detail,
  status: "unavailable",
});

const parseClockMinutes = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

const formatDaylightDuration = (sunrise?: string, sunset?: string): string => {
  const sunriseMinutes = parseClockMinutes(sunrise);
  const sunsetMinutes = parseClockMinutes(sunset);

  if (sunriseMinutes === null || sunsetMinutes === null || sunsetMinutes <= sunriseMinutes) {
    return "--";
  }

  const totalMinutes = sunsetMinutes - sunriseMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

export const buildComfortMetrics = (weather: CityWeatherBundle | null): ComfortMetric[] => {
  if (!weather?.current) {
    return [];
  }

  const today = weather.daily[0];
  const daylight = formatDaylightDuration(today?.sunrise, today?.sunset);

  return [
    {
      id: "feels-like",
      label: "Feels Like / 体感",
      value: `${weather.current.feelsLike}°`,
      detail: "Human-perceived temperature / 人体感知温度",
      status: "available",
    },
    {
      id: "visibility",
      label: "Visibility / 能见度",
      value: weather.current.visibility === "--" ? "--" : `${weather.current.visibility} km`,
      detail: "Surface visibility estimate / 地面能见度",
      status: weather.current.visibility === "--" ? "unavailable" : "available",
    },
    {
      id: "pressure",
      label: "Pressure / 气压",
      value: weather.current.pressure === "--" ? "--" : `${weather.current.pressure} hPa`,
      detail: "Station pressure / 站点气压",
      status: weather.current.pressure === "--" ? "unavailable" : "available",
    },
    today?.uvIndex
      ? {
          id: "uv-index",
          label: "UV Index / 紫外线",
          value: today.uvIndex,
          detail: "Daily ultraviolet exposure / 日间紫外线强度",
          status: "available",
        }
      : unavailableMetric("uv-index", "UV Index / 紫外线", "Unavailable in the current payload / 当前响应未提供"),
    daylight !== "--"
      ? {
          id: "daylight",
          label: "Daylight / 日照时长",
          value: daylight,
          detail: `${today?.sunrise ?? "--"} - ${today?.sunset ?? "--"}`,
          status: "available",
        }
      : unavailableMetric("daylight", "Daylight / 日照时长", "Sunrise or sunset unavailable / 缺少日出日落数据"),
  ];
};
