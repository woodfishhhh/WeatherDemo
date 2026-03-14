import {
  isCloudSyncEnabled,
  loadCloudSavedCities,
  saveCloudSavedCities,
} from "./persistence.cloud";
import { getOrCreateClientId } from "./persistence.identity";
import {
  getSavedCitiesSnapshot,
  writeLocalSavedCities,
} from "./persistence.local";
import type {
  SavedCity,
  SavedCitiesSyncResult,
  SavedCitiesSyncStatus,
} from "./persistence.types";

export { getOrCreateClientId };
export { getSavedCitiesSnapshot, writeLocalSavedCities };
export type {
  SavedCity,
  SavedCitiesEnvelope,
  SavedCitiesSyncResult,
  SavedCitiesSyncStatus,
} from "./persistence.types";

type LoadSavedCitiesOptions = {
  onCloudUpdate?: (cities: SavedCity[]) => void;
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

export const saveSavedCities = async (cities: SavedCity[]): Promise<SavedCitiesSyncResult> => {
  const normalized = writeLocalSavedCities(cities);

  if (!isCloudSyncEnabled()) {
    return createSyncResult(normalized, "ready");
  }

  try {
    await saveCloudSavedCities(normalized);
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

  if (!isCloudSyncEnabled()) {
    options.onCloudUpdate?.(localCities);
    return createSyncResult(localCities, "ready");
  }

  try {
    const cloudCities = await loadCloudSavedCities();

    if (cloudCities.length > 0) {
      const normalizedCloudCities = writeLocalSavedCities(cloudCities);
      options.onCloudUpdate?.(normalizedCloudCities);
      return createSyncResult(normalizedCloudCities, "ready");
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
