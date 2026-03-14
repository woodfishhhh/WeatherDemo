import { isAxiosError } from "axios";
import { appEnv } from "@/config/env";
import { httpClient } from "@/lib/http/client";

export type QWeatherLocation = {
  id?: string;
  name?: string;
  adm1?: string;
  adm2?: string;
  country?: string;
  countryCode?: string;
  tz?: string;
  lat?: string;
  lon?: string;
  adcode?: string;
  fxLink?: string;
};

export type QWeatherResponse<T> = {
  code?: string;
  location?: T[];
  now?: Record<string, string>;
  hourly?: Array<Record<string, string>>;
  daily?: Array<Record<string, string>>;
};

export type QWeatherHistoricalResponse = {
  code?: string;
  weatherDaily?: Record<string, string> | Array<Record<string, string>>;
  weatherHourly?: Array<Record<string, string>>;
};

export type QWeatherDataset =
  | "location"
  | "current"
  | "hourly"
  | "daily"
  | "air-quality"
  | "historical-trends";

export type CachedQWeatherDataset = Exclude<QWeatherDataset, "location">;

export type QWeatherAdapterErrorCode = "invalid-payload" | "provider-error" | "unauthorized";

export class QWeatherAdapterError extends Error {
  readonly name = "QWeatherAdapterError";
  readonly dataset: QWeatherDataset;
  readonly code: QWeatherAdapterErrorCode;

  constructor(dataset: QWeatherDataset, code: QWeatherAdapterErrorCode, message: string) {
    super(message);
    this.dataset = dataset;
    this.code = code;
  }
}

export const createAdapterError = (
  dataset: QWeatherDataset,
  code: QWeatherAdapterErrorCode,
  message: string
): QWeatherAdapterError => new QWeatherAdapterError(dataset, code, message);

export function unwrapResponse<T>(
  data: QWeatherResponse<T>,
  dataset: QWeatherDataset,
  message: string
): QWeatherResponse<T>;
export function unwrapResponse(
  data: QWeatherHistoricalResponse,
  dataset: QWeatherDataset,
  message: string
): QWeatherHistoricalResponse;
export function unwrapResponse<T>(
  data: QWeatherResponse<T> | QWeatherHistoricalResponse,
  dataset: QWeatherDataset,
  message: string
): QWeatherResponse<T> | QWeatherHistoricalResponse {
  if (data.code && data.code !== "200") {
    throw createAdapterError(dataset, "provider-error", message);
  }

  return data;
}

export const isAuthorizationLikeError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === 401 || status === 403;
};

export const toQWeatherError = (error: unknown, dataset: QWeatherDataset, fallback: string): Error => {
  if (error instanceof QWeatherAdapterError) {
    return error;
  }

  if (isAxiosError(error)) {
    const detail = error.response?.data?.error?.detail;
    const title = error.response?.data?.error?.title;

    if (typeof detail === "string" && /invalid or unauthorized api host/i.test(detail)) {
      return createAdapterError(
        dataset,
        "provider-error",
        "QWeather API Host is invalid for this key. Please set VITE_QWEATHER_API_HOST to your dedicated host."
      );
    }

    if (typeof title === "string") {
      return createAdapterError(
        dataset,
        isAuthorizationLikeError(error) ? "unauthorized" : "provider-error",
        "QWeather error: " + title
      );
    }
  }

  if (error instanceof Error) {
    return createAdapterError(dataset, "provider-error", error.message);
  }

  return createAdapterError(dataset, "provider-error", fallback);
};

export const fetchLocationSearchResponse = async (
  keyword: string,
  signal?: AbortSignal
): Promise<QWeatherResponse<QWeatherLocation>> => {
  const { data } = await httpClient.get<QWeatherResponse<QWeatherLocation>>(appEnv.qweather.geoBaseUrl + "/v2/city/lookup", {
    params: {
      location: keyword,
      range: "cn",
      number: 10,
    },
    signal,
  });

  return data;
};

export const fetchCoordinateLookupResponse = async (
  longitude: number | string,
  latitude: number | string
): Promise<QWeatherResponse<QWeatherLocation>> => {
  const { data } = await httpClient.get<QWeatherResponse<QWeatherLocation>>(appEnv.qweather.geoBaseUrl + "/v2/city/lookup", {
    params: {
      location: String(longitude) + "," + String(latitude),
    },
  });

  return data;
};

export const fetchCurrentWeatherResponse = async (locationQuery: string): Promise<QWeatherResponse<never>> => {
  const { data } = await httpClient.get<QWeatherResponse<never>>(appEnv.qweather.weatherBaseUrl + "/v7/weather/now", {
    params: {
      location: locationQuery,
    },
  });

  return data;
};

export const fetchHourlyForecastResponse = async (locationQuery: string): Promise<QWeatherResponse<never>> => {
  const { data } = await httpClient.get<QWeatherResponse<never>>(appEnv.qweather.weatherBaseUrl + "/v7/weather/24h", {
    params: {
      location: locationQuery,
    },
  });

  return data;
};

export const fetchDailyForecastResponse = async (locationQuery: string): Promise<QWeatherResponse<never>> => {
  const { data } = await httpClient.get<QWeatherResponse<never>>(appEnv.qweather.weatherBaseUrl + "/v7/weather/7d", {
    params: {
      location: locationQuery,
    },
  });

  return data;
};

export const fetchAirQualityResponse = async (locationQuery: string): Promise<QWeatherResponse<never>> => {
  const { data } = await httpClient.get<QWeatherResponse<never>>(appEnv.qweather.weatherBaseUrl + "/v7/air/now", {
    params: {
      location: locationQuery,
    },
  });

  return data;
};

export const fetchHistoricalWeatherResponse = async (
  locationQuery: string,
  date: string
): Promise<QWeatherHistoricalResponse> => {
  const { data } = await httpClient.get<QWeatherHistoricalResponse>(appEnv.qweather.weatherBaseUrl + "/v7/historical/weather", {
    params: {
      location: locationQuery,
      date,
    },
  });

  return data;
};
