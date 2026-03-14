import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_MEASUREMENT_ID",
  "VITE_QWEATHER_API_KEY",
  "VITE_QWEATHER_API_HOST",
  "VITE_QWEATHER_ICON_BASE_URL",
] as const;

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, (import.meta.env as Record<string, string | undefined>)[key]])
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

const applyEnv = (overrides: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>): void => {
  const env = import.meta.env as Record<string, string | undefined>;

  for (const key of ENV_KEYS) {
    if (key in overrides) {
      const nextValue = overrides[key];
      if (nextValue === undefined) {
        delete env[key];
      } else {
        env[key] = nextValue;
      }
      continue;
    }

    delete env[key];
  }
};

const loadEnvModule = async () => {
  vi.resetModules();
  return await import("./env");
};

describe("app env normalization", () => {
  beforeEach(() => {
    applyEnv({});
  });

  afterEach(() => {
    applyEnv(originalEnv);
  });

  it("treats placeholder Firebase credentials as unavailable configuration", async () => {
    applyEnv({
      VITE_FIREBASE_API_KEY: " your-firebase-api-key ",
      VITE_FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "your-project-id",
      VITE_FIREBASE_STORAGE_BUCKET: "your-project.appspot.com",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "your-messaging-sender-id",
      VITE_FIREBASE_APP_ID: "your-firebase-app-id",
      VITE_FIREBASE_MEASUREMENT_ID: " G-EXAMPLE ",
    });

    const { appEnv, hasFirebaseConfig, isPlaceholderFirebaseValue } = await loadEnvModule();

    expect(appEnv.firebase).toMatchObject({
      apiKey: "your-firebase-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "your-messaging-sender-id",
      appId: "your-firebase-app-id",
      measurementId: "G-EXAMPLE",
    });
    expect(isPlaceholderFirebaseValue(" your-firebase-api-key ")).toBe(true);
    expect(hasFirebaseConfig()).toBe(false);
  });

  it("falls back to default qweather hosts when api host is blank or missing", async () => {
    applyEnv({
      VITE_QWEATHER_API_KEY: "test-key",
      VITE_QWEATHER_API_HOST: "   ",
    });

    const { appEnv, hasQWeatherApiKey } = await loadEnvModule();

    expect(hasQWeatherApiKey()).toBe(true);
    expect(appEnv.qweather.apiHost).toBeUndefined();
    expect(appEnv.qweather.geoBaseUrl).toBe("https://geoapi.qweather.com");
    expect(appEnv.qweather.weatherBaseUrl).toBe("https://devapi.qweather.com");
    expect(appEnv.qweather.iconBaseUrl).toBe("https://icons.qweather.com/assets/icons");
  });

  it("normalizes a trimmed qweather host even when the scheme is omitted", async () => {
    applyEnv({
      VITE_QWEATHER_API_HOST: " weather.example.com/ ",
      VITE_QWEATHER_ICON_BASE_URL: " https://cdn.example.com/qweather-icons ",
    });

    const { appEnv } = await loadEnvModule();

    expect(appEnv.qweather.apiHost).toBe("https://weather.example.com/");
    expect(appEnv.qweather.geoBaseUrl).toBe("https://weather.example.com/geo");
    expect(appEnv.qweather.weatherBaseUrl).toBe("https://weather.example.com");
    expect(appEnv.qweather.iconBaseUrl).toBe("https://cdn.example.com/qweather-icons");
  });
});
