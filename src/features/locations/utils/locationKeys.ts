import type { LocationRecord } from "@/features/weather/types";
import type { SavedCity } from "@/features/locations/services/persistence";

const normalizeValue = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeCoords = (latitude?: string, longitude?: string): string | undefined => {
  const normalizedLatitude = normalizeValue(latitude);
  const normalizedLongitude = normalizeValue(longitude);

  return normalizedLatitude && normalizedLongitude ? `${normalizedLatitude},${normalizedLongitude}` : undefined;
};

const collectSavedCityAliases = (
  city: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">
): string[] => {
  const aliases = [
    normalizeValue(city.locationId) ? `location:${normalizeValue(city.locationId)}` : undefined,
    normalizeValue(city.adcode) ? `adcode:${normalizeValue(city.adcode)}` : undefined,
    normalizeCoords(city.latitude, city.longitude) ? `coords:${normalizeCoords(city.latitude, city.longitude)}` : undefined,
    normalizeValue(city.id) ? `id:${normalizeValue(city.id)}` : undefined,
    normalizeValue(city.province) && normalizeValue(city.city)
      ? `name:${normalizeValue(city.province)}::${normalizeValue(city.city)}`
      : undefined,
  ].filter((alias): alias is string => Boolean(alias));

  return Array.from(new Set(aliases));
};

const collectLocationAliases = (
  location: Pick<LocationRecord, "id" | "province" | "name" | "latitude" | "longitude" | "adcode">
): string[] => {
  const aliases = [
    normalizeValue(location.id) ? `location:${normalizeValue(location.id)}` : undefined,
    normalizeValue(location.adcode) ? `adcode:${normalizeValue(location.adcode)}` : undefined,
    normalizeCoords(location.latitude, location.longitude) ? `coords:${normalizeCoords(location.latitude, location.longitude)}` : undefined,
    normalizeValue(location.province) && normalizeValue(location.name)
      ? `name:${normalizeValue(location.province)}::${normalizeValue(location.name)}`
      : undefined,
  ].filter((alias): alias is string => Boolean(alias));

  return Array.from(new Set(aliases));
};

export const getSavedCityKey = (
  city: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">
): string =>
  collectSavedCityAliases(city)[0] || `${city.province}::${city.city}`;

export const getLocationRecordKey = (
  location: Pick<LocationRecord, "id" | "province" | "name" | "latitude" | "longitude" | "adcode">
): string =>
  collectLocationAliases(location)[0] || `coords:${location.latitude},${location.longitude}`;

export const isSameSavedCity = (
  left: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">,
  right: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">
): boolean => {
  const rightAliases = new Set(collectSavedCityAliases(right));
  return collectSavedCityAliases(left).some((alias) => rightAliases.has(alias));
};

export const matchesSavedCityLocation = (
  city: Pick<SavedCity, "id" | "province" | "city" | "locationId" | "adcode" | "latitude" | "longitude">,
  location: Pick<LocationRecord, "id" | "province" | "name" | "latitude" | "longitude" | "adcode">
): boolean => {
  const locationAliases = new Set(collectLocationAliases(location));
  return collectSavedCityAliases(city).some((alias) => locationAliases.has(alias));
};

export const mergeSavedCityRecords = (existing: SavedCity, incoming: SavedCity): SavedCity => ({
  id: normalizeValue(existing.id) || incoming.id,
  province: normalizeValue(existing.province) || incoming.province,
  city: normalizeValue(existing.city) || incoming.city,
  adcode: normalizeValue(existing.adcode) || incoming.adcode,
  locationId: normalizeValue(existing.locationId) || incoming.locationId,
  latitude: normalizeValue(existing.latitude) || incoming.latitude,
  longitude: normalizeValue(existing.longitude) || incoming.longitude,
  timezone: normalizeValue(existing.timezone) || incoming.timezone,
  country: normalizeValue(existing.country) || incoming.country,
  countryCode: normalizeValue(existing.countryCode) || incoming.countryCode,
});

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
