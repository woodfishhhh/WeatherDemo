export const STORAGE_SCHEMA_VERSION = 2;

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

export type SavedCitiesEnvelope = {
  version: number;
  cities: SavedCity[];
};
