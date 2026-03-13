import type { LocationRecord } from "@/features/weather/types";
import type { SavedCity } from "@/services/savedCities";

export const getSavedCityKey = (
  city: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">
): string =>
  city.locationId
    ? `location:${city.locationId}`
    : city.adcode
      ? `adcode:${city.adcode}`
      : city.latitude && city.longitude
        ? `coords:${city.latitude},${city.longitude}`
        : city.id || `${city.province}::${city.city}`;

export const getLocationRecordKey = (
  location: Pick<LocationRecord, "id" | "province" | "name" | "latitude" | "longitude" | "adcode">
): string =>
  location.id
    ? `location:${location.id}`
    : location.adcode
      ? `adcode:${location.adcode}`
      : `coords:${location.latitude},${location.longitude}`;

export const toSavedCityRecord = (location: LocationRecord, existingId?: string): SavedCity => ({
  id: existingId || location.id,
  province: location.province || location.name,
  city: location.name,
  adcode: location.adcode,
  locationId: location.id,
  latitude: location.latitude,
  longitude: location.longitude,
  timezone: location.timezone,
  country: location.country,
});
