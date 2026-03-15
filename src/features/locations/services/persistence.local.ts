import { createPersistenceId } from "./persistence.identity";
import {
  STORAGE_SCHEMA_VERSION,
  type SavedCity,
  type SavedCitiesEnvelope,
} from "./persistence.types";
import { getSavedCityKey, isSameSavedCity, mergeSavedCityRecords } from "@/features/locations/utils/locationKeys";

const STORAGE_KEY = "savedCities";

export const normalizeSavedCities = (input: unknown): SavedCity[] => {
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
        typeof city.id === "string" && city.id.trim() ? city.id.trim() : adcode || locationId || createPersistenceId();

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
    const matchingEntry = Array.from(unique.entries()).find(([, existing]) => isSameSavedCity(existing, city));

    if (matchingEntry) {
      const [existingKey, existingCity] = matchingEntry;
      unique.set(existingKey, mergeSavedCityRecords(existingCity, city));
      continue;
    }

    unique.set(getSavedCityKey(city), city);
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

export const writeLocalSavedCities = (cities: SavedCity[]): SavedCity[] => {
  const envelope = createEnvelope(cities);
  writeLocalEnvelope(envelope);
  return envelope.cities;
};

export const getSavedCitiesSnapshot = (): SavedCity[] => readLocalEnvelope().cities;
