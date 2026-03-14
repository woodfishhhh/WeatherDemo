import type { SavedCity } from "@/features/locations/services/persistence";
import { resolveLocation } from "@/features/weather/services/qweather";
import type { LocationRecord } from "@/features/weather/types";

export const getSavedCityLocationId = (city: Pick<SavedCity, "id" | "locationId">): string =>
  city.locationId || city.id;

export const toLocationRecordFromSavedCity = (city: SavedCity): LocationRecord | null => {
  if (!city.latitude || !city.longitude) {
    return null;
  }

  return {
    id: city.locationId ?? "",
    name: city.city,
    province: city.province,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
    country: city.country,
    countryCode: city.countryCode,
    adcode: city.adcode,
  };
};

export const resolveSavedCityLocation = async (city: SavedCity): Promise<LocationRecord | null> => {
  const directLocation = toLocationRecordFromSavedCity(city);
  if (directLocation) {
    return directLocation;
  }

  return resolveLocation({
    id: city.locationId,
    city: city.city,
    province: city.province,
  });
};
