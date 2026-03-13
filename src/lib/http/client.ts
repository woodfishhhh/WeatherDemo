import axios from "axios";
import { appEnv, hasQWeatherApiKey } from "@/config/env";

export const httpClient = axios.create({
  timeout: 12000,
});

httpClient.interceptors.request.use((config) => {
  const headers = config.headers ?? {};

  if (hasQWeatherApiKey()) {
    headers["X-QW-Api-Key"] = appEnv.qweather.apiKey;
  }

  config.headers = headers;
  return config;
});

