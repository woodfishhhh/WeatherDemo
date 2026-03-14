import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const COOKIE_KEY = "weather_client_id";
const STORAGE_KEY = "savedCities";
const STORAGE_SCHEMA_VERSION = 2;
const COLLECTION_NAME = "weather_saved_cities";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

export type SavedCity = {
  id: string;
  province: string;
  city: string;
  adcode?: string;
  locationId?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  country?: string;
  countryCode?: string;
};

export type SavedCitiesSyncStatus = "ready" | "recoverable-error";

export type SavedCitiesSyncResult = {
  cities: SavedCity[];
  syncStatus: SavedCitiesSyncStatus;
  reason?: string;
};

type LoadSavedCitiesOptions = {
  onCloudUpdate?: (cities: SavedCity[]) => void;
};

type SavedCitiesEnvelope = {
  version: number;
  cities: SavedCity[];
};

const parseCookie = (name: string): string | null => {
  const prefix = `${name}=`;
  const parts = document.cookie.split(";");

  for (const part of parts) {
    const value = part.trim();
    if (value.startsWith(prefix)) {
      return decodeURIComponent(value.slice(prefix.length));
    }
  }

  return null;
};

const createClientId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getCanonicalSavedCityKey = (city: SavedCity): string =>
  city.adcode
    ? `adcode:${city.adcode}`
    : city.locationId
      ? `location:${city.locationId}`
      : city.latitude && city.longitude
        ? `coords:${city.latitude},${city.longitude}`
        : city.id || `${city.province}::${city.city}`;

const normalizeSavedCities = (input: unknown): SavedCity[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const mapped = input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const city = item as Record<string, unknown>;
      const province = typeof city.province === "string" ? city.province.trim() : "";
      const cityName = typeof city.city === "string" ? city.city.trim() : "";
      const adcode = typeof city.adcode === "string" && city.adcode.trim() ? city.adcode.trim() : undefined;
      const locationId =
        typeof city.locationId === "string" && city.locationId.trim()
          ? city.locationId.trim()
          : typeof city.qweatherId === "string" && city.qweatherId.trim()
            ? city.qweatherId.trim()
            : undefined;
      const latitude = typeof city.latitude === "string" && city.latitude.trim() ? city.latitude.trim() : undefined;
      const longitude =
        typeof city.longitude === "string" && city.longitude.trim() ? city.longitude.trim() : undefined;
      const timezone = typeof city.timezone === "string" && city.timezone.trim() ? city.timezone.trim() : undefined;
      const country = typeof city.country === "string" && city.country.trim() ? city.country.trim() : undefined;
      const countryCode =
        typeof city.countryCode === "string" && city.countryCode.trim() ? city.countryCode.trim() : undefined;
      const id =
        typeof city.id === "string" && city.id.trim() ? city.id.trim() : adcode || locationId || createClientId();

      if (!province || !cityName) {
        return null;
      }

      return {
        id,
        province,
        city: cityName,
        adcode,
        locationId,
        latitude,
        longitude,
        timezone,
        country,
        countryCode,
      } as SavedCity;
    })
    .filter((item): item is SavedCity => item !== null);

  const unique = new Map<string, SavedCity>();
  for (const city of mapped) {
    const key = getCanonicalSavedCityKey(city);
    if (!unique.has(key)) {
      unique.set(key, city);
    }
  }

  return Array.from(unique.values());
};

const createEnvelope = (cities: SavedCity[]): SavedCitiesEnvelope => ({
  version: STORAGE_SCHEMA_VERSION,
  cities: normalizeSavedCities(cities),
});

const normalizeEnvelope = (input: unknown): SavedCitiesEnvelope => {
  if (Array.isArray(input)) {
    return createEnvelope(input);
  }

  if (input && typeof input === "object") {
    const raw = input as Partial<SavedCitiesEnvelope>;
    if (Array.isArray(raw.cities)) {
      return createEnvelope(raw.cities);
    }
  }

  return createEnvelope([]);
};

export const getOrCreateClientId = (): string => {
  const current = parseCookie(COOKIE_KEY);
  if (current) {
    return current;
  }

  const clientId = createClientId();
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(clientId)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  return clientId;
};

const getCitiesDocRef = () => {
  const clientId = getOrCreateClientId();
  return doc(db, COLLECTION_NAME, clientId);
};

const writeLocalEnvelope = (envelope: SavedCitiesEnvelope): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
};

const readLocalEnvelope = (): SavedCitiesEnvelope => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEnvelope([]);
  }

  try {
    const parsed = JSON.parse(raw);
    const envelope = normalizeEnvelope(parsed);
    const requiresRewrite =
      Array.isArray(parsed) ||
      !parsed ||
      typeof parsed !== "object" ||
      !("version" in parsed) ||
      (parsed as SavedCitiesEnvelope).version !== STORAGE_SCHEMA_VERSION ||
      !Array.isArray((parsed as SavedCitiesEnvelope).cities);

    if (requiresRewrite) {
      writeLocalEnvelope(envelope);
    }

    return envelope;
  } catch {
    return createEnvelope([]);
  }
};

const createSyncResult = (
  cities: SavedCity[],
  syncStatus: SavedCitiesSyncStatus,
  reason?: string
): SavedCitiesSyncResult => ({
  cities,
  syncStatus,
  reason,
});

export const writeLocalSavedCities = (cities: SavedCity[]): SavedCity[] => {
  const envelope = createEnvelope(cities);
  writeLocalEnvelope(envelope);
  return envelope.cities;
};

export const getSavedCitiesSnapshot = (): SavedCity[] => readLocalEnvelope().cities;

export const saveSavedCities = async (cities: SavedCity[]): Promise<SavedCitiesSyncResult> => {
  const normalized = writeLocalSavedCities(cities);

  try {
    await setDoc(
      getCitiesDocRef(),
      {
        version: STORAGE_SCHEMA_VERSION,
        cities: normalized,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return createSyncResult(normalized, "ready");
  } catch (error) {
    console.error("Failed to sync saved cities to Firebase:", error);
    return createSyncResult(
      normalized,
      "recoverable-error",
      error instanceof Error ? error.message : "Failed to sync saved cities to Firebase."
    );
  }
};

export const loadSavedCities = async (): Promise<SavedCitiesSyncResult> => loadSavedCitiesWithSync();

export const loadSavedCitiesWithSync = async (
  options: LoadSavedCitiesOptions = {}
): Promise<SavedCitiesSyncResult> => {
  const localCities = getSavedCitiesSnapshot();

  try {
    const snap = await getDoc(getCitiesDocRef());
    const cloudCities = snap.exists() ? normalizeSavedCities(snap.data()?.cities) : [];

    if (cloudCities.length > 0) {
      writeLocalSavedCities(cloudCities);
      options.onCloudUpdate?.(cloudCities);
      return createSyncResult(cloudCities, "ready");
    }

    if (localCities.length > 0) {
      const persisted = await saveSavedCities(localCities);
      options.onCloudUpdate?.(persisted.cities);
      return persisted;
    }

    options.onCloudUpdate?.([]);
    return createSyncResult([], "ready");
  } catch (error) {
    console.error("Failed to load saved cities from Firebase:", error);
    options.onCloudUpdate?.(localCities);
    return createSyncResult(
      localCities,
      "recoverable-error",
      error instanceof Error ? error.message : "Failed to load saved cities from Firebase."
    );
  }
};
