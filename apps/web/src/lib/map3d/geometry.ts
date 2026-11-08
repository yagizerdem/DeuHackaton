export type LngLat = [number, number];

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;
const toRad = Math.PI / 180;

/** The average of the corners is close enough to the middle of a field. */
export function centroidOf(polygon: LngLat[]): LatLng {
  const n = polygon.length;
  return {
    lat: polygon.reduce((sum, [, lat]) => sum + lat, 0) / n,
    lng: polygon.reduce((sum, [lng]) => sum + lng, 0) / n,
  };
}

/** Meters east (x) and north (y) of `origin`, accurate for a few kilometers. */
export function toLocalMeters(origin: LatLng, point: LatLng) {
  return {
    x: (point.lng - origin.lng) * toRad * EARTH_RADIUS_M * Math.cos(origin.lat * toRad),
    y: (point.lat - origin.lat) * toRad * EARTH_RADIUS_M,
  };
}

/** Inverse of toLocalMeters. */
export function fromLocalMeters(origin: LatLng, x: number, y: number): LatLng {
  return {
    lat: origin.lat + y / (toRad * EARTH_RADIUS_M),
    lng: origin.lng + x / (toRad * EARTH_RADIUS_M * Math.cos(origin.lat * toRad)),
  };
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return (2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))) / 1000;
}

export function perimeterM(polygon: LngLat[]): number {
  return polygon.reduce((sum, [lng, lat], i) => {
    const [nextLng, nextLat] = polygon[(i + 1) % polygon.length]!;
    return sum + distanceKm({ lat, lng }, { lat: nextLat, lng: nextLng }) * 1000;
  }, 0);
}

/** Ray casting, the polygon ring does not have to be closed. */
export function pointInPolygon(point: LatLng, polygon: LngLat[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function boundsOf(points: LatLng[]) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    south: Math.min(...lats),
    north: Math.max(...lats),
    west: Math.min(...lngs),
    east: Math.max(...lngs),
  };
}

/** Largest distance from the center to any corner, in meters. */
export function radiusM(polygon: LngLat[], center: LatLng): number {
  return Math.max(
    ...polygon.map(([lng, lat]) => distanceKm(center, { lat, lng }) * 1000),
  );
}
