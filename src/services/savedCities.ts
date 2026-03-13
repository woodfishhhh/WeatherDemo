import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const COOKIE_KEY = "weather_client_id";
const STORAGE_KEY = "savedCities";
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
};

type LoadSavedCitiesOptions = {
  onCloudUpdate?: (cities: SavedCity[]) => void;
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

export const getOrCreateClientId = (): string => {
  const current = parseCookie(COOKIE_KEY);
  if (current) {
    return current;
  }

  const clientId = createClientId();
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(clientId)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;

  return clientId;
};

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
      const locationId =
        typeof city.locationId === "string" && city.locationId.trim()
          ? city.locationId.trim()
          : typeof city.qweatherId === "string" && city.qweatherId.trim()
            ? city.qweatherId.trim()
            : undefined;
      const latitude = typeof city.latitude === "string" ? city.latitude.trim() : undefined;
      const longitude = typeof city.longitude === "string" ? city.longitude.trim() : undefined;
      const timezone = typeof city.timezone === "string" ? city.timezone.trim() : undefined;
      const country = typeof city.country === "string" ? city.country.trim() : undefined;
      const id =
        typeof city.id === "string" && city.id.trim()
          ? city.id
          : locationId || createClientId();
      const adcode = typeof city.adcode === "string" ? city.adcode : undefined;

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
      } as SavedCity;
    })
    .filter((item): item is SavedCity => item !== null);

  const unique = new Map<string, SavedCity>();
  for (const city of mapped) {
    const key = city.locationId
      ? `location:${city.locationId}`
      : city.adcode
        ? `adcode:${city.adcode}`
        : `${city.province}::${city.city}`;
    if (!unique.has(key)) {
      unique.set(key, city);
    }
  }

  return Array.from(unique.values());
};

export const readLocalSavedCities = (): SavedCity[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return normalizeSavedCities(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const writeLocalSavedCities = (cities: SavedCity[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSavedCities(cities)));
};

export const getSavedCitiesSnapshot = (): SavedCity[] => readLocalSavedCities();

const getCitiesDocRef = () => {
  const clientId = getOrCreateClientId();
  return doc(db, COLLECTION_NAME, clientId);
};

export const saveSavedCities = async (cities: SavedCity[]): Promise<SavedCity[]> => {
  const normalized = normalizeSavedCities(cities);
  writeLocalSavedCities(normalized);

  try {
    await setDoc(
      getCitiesDocRef(),
      {
        cities: normalized,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to sync saved cities to Firebase:", error);
  }

  return normalized;
};

export const loadSavedCities = async (): Promise<SavedCity[]> => {
  return loadSavedCitiesWithSync();
};

export const loadSavedCitiesWithSync = async (
  options: LoadSavedCitiesOptions = {}
): Promise<SavedCity[]> => {
  const localCities = readLocalSavedCities();

  try {
    const snap = await getDoc(getCitiesDocRef());
    const cloudCities = snap.exists() ? normalizeSavedCities(snap.data()?.cities) : [];

    if (cloudCities.length > 0) {
      writeLocalSavedCities(cloudCities);
      options.onCloudUpdate?.(cloudCities);
      return cloudCities;
    }

    if (localCities.length > 0) {
      await saveSavedCities(localCities);
      options.onCloudUpdate?.(localCities);
      return localCities;
    }

    options.onCloudUpdate?.([]);
    return [];
  } catch (error) {
    console.error("Failed to load saved cities from Firebase:", error);
    options.onCloudUpdate?.(localCities);
    return localCities;
  }
};
