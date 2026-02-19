export type Coords = { latitude: number; longitude: number };

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Haversine distance in miles
export function distanceMiles(a: Coords, b: Coords) {
  const R = 3958.7613; // Earth radius in miles
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * (sinDLon * sinDLon);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export type FarmWithCoords = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  products: string;
  latitude: number;
  longitude: number;

  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};


export type FarmWithDistance = FarmWithCoords & { distanceMi: number | null };

export function addDistanceAndSort(
  farms: FarmWithCoords[],
  userCoords: Coords | null
): FarmWithDistance[] {
  return farms
    .map((farm) => {
      const distanceMi = userCoords
        ? distanceMiles(userCoords, { latitude: farm.latitude, longitude: farm.longitude })
        : null;

      return { ...farm, distanceMi };
    })
    .sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity));
}
