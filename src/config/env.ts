type EnvValue = string | undefined;

const FIREBASE_PLACEHOLDER_VALUES = new Set([
  "your-firebase-api-key",
  "your-project.firebaseapp.com",
  "your-project-id",
  "your-project.appspot.com",
  "your-messaging-sender-id",
  "your-firebase-app-id",
]);

const trimEnv = (value: EnvValue): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeUrlHost = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const qweatherApiHost = normalizeUrlHost(trimEnv(import.meta.env.VITE_QWEATHER_API_HOST));

const buildHost = (fallback: string, pathPrefix = ""): string => {
  if (!qweatherApiHost) {
    return fallback;
  }

  const normalizedHost = qweatherApiHost.replace(/\/+$/, "");
  return `${normalizedHost}${pathPrefix}`;
};

export const appEnv = {
  firebase: {
    apiKey: trimEnv(import.meta.env.VITE_FIREBASE_API_KEY) ?? "",
    authDomain: trimEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ?? "",
    projectId: trimEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) ?? "",
    storageBucket: trimEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ?? "",
    messagingSenderId: trimEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ?? "",
    appId: trimEnv(import.meta.env.VITE_FIREBASE_APP_ID) ?? "",
    measurementId: trimEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
  },
  qweather: {
    apiKey: trimEnv(import.meta.env.VITE_QWEATHER_API_KEY) ?? "",
    apiHost: qweatherApiHost,
    geoBaseUrl: buildHost("https://geoapi.qweather.com", "/geo"),
    weatherBaseUrl: buildHost("https://devapi.qweather.com"),
    iconBaseUrl:
      trimEnv(import.meta.env.VITE_QWEATHER_ICON_BASE_URL) ??
      "https://icons.qweather.com/assets/icons",
  },
};

export const isPlaceholderFirebaseValue = (value: string | undefined): boolean =>
  Boolean(value && FIREBASE_PLACEHOLDER_VALUES.has(value.trim().toLowerCase()));

export const hasFirebaseConfig = (): boolean =>
  Boolean(
    appEnv.firebase.apiKey &&
      !isPlaceholderFirebaseValue(appEnv.firebase.apiKey) &&
      appEnv.firebase.authDomain &&
      !isPlaceholderFirebaseValue(appEnv.firebase.authDomain) &&
      appEnv.firebase.projectId &&
      !isPlaceholderFirebaseValue(appEnv.firebase.projectId) &&
      appEnv.firebase.storageBucket &&
      !isPlaceholderFirebaseValue(appEnv.firebase.storageBucket) &&
      appEnv.firebase.messagingSenderId &&
      !isPlaceholderFirebaseValue(appEnv.firebase.messagingSenderId) &&
      appEnv.firebase.appId &&
      !isPlaceholderFirebaseValue(appEnv.firebase.appId)
  );

export const hasQWeatherApiKey = (): boolean => Boolean(appEnv.qweather.apiKey);
