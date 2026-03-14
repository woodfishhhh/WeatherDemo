import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, hasFirebaseConfig } from "@/firebase";
import { getOrCreateClientId } from "./persistence.identity";
import { normalizeSavedCities } from "./persistence.local";
import { STORAGE_SCHEMA_VERSION, type SavedCity } from "./persistence.types";

const COLLECTION_NAME = "weather_saved_cities";

const getCitiesDocRef = () => {
  if (db === null) {
    throw new Error("Firebase cloud sync is unavailable.");
  }

  const clientId = getOrCreateClientId();
  return doc(db, COLLECTION_NAME, clientId);
};

const sanitizeSavedCityForFirestore = (city: SavedCity): SavedCity => {
  const sanitized = Object.fromEntries(
    Object.entries(city).filter(([, value]) => value !== undefined)
  );

  return sanitized as SavedCity;
};

export const isCloudSyncEnabled = (): boolean => hasFirebaseConfig() && db !== null;

export const saveCloudSavedCities = async (cities: SavedCity[]): Promise<void> => {
  const firestoreCities = cities.map(sanitizeSavedCityForFirestore);

  await setDoc(
    getCitiesDocRef(),
    {
      version: STORAGE_SCHEMA_VERSION,
      cities: firestoreCities,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const loadCloudSavedCities = async (): Promise<SavedCity[]> => {
  const snap = await getDoc(getCitiesDocRef());
  return snap.exists() ? normalizeSavedCities(snap.data()?.cities) : [];
};
