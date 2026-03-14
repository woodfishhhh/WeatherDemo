export type {
  SavedCity,
  SavedCitiesSyncResult,
  SavedCitiesSyncStatus,
} from "@/features/locations/services/persistence";
export {
  getOrCreateClientId,
  getSavedCitiesSnapshot,
  loadSavedCities,
  loadSavedCitiesWithSync,
  saveSavedCities,
  writeLocalSavedCities,
} from "@/features/locations/services/persistence";
