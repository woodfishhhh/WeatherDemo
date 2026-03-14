import type { LocationRecord } from "@/features/weather/types";
import type { SavedCity } from "@/features/locations/services/persistence";

export const getSavedCityKey = (
  city: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">
): string =>
  city.adcode
    ? `adcode:${city.adcode}`
    : city.locationId
      ? `location:${city.locationId}`
      : city.latitude && city.longitude
        ? `coords:${city.latitude},${city.longitude}`
        : city.id || `${city.province}::${city.city}`;

export const getLocationRecordKey = (
  location: Pick<LocationRecord, "id" | "province" | "name" | "latitude" | "longitude" | "adcode">
): string =>
  location.adcode
    ? `adcode:${location.adcode}`
    : location.id
      ? `location:${location.id}`
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
  countryCode: location.countryCode,
});
