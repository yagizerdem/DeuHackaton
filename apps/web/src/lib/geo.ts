const EARTH_RADIUS_M = 6_371_000;

// Area of a [lng, lat] polygon in hectares. A local equirectangular projection
// is accurate enough for fields and gardens.
export function polygonAreaHa(polygon: [number, number][]): number {
  if (polygon.length < 3) return 0;

  const toRad = Math.PI / 180;
  const lat0 = polygon.reduce((sum, [, lat]) => sum + lat, 0) / polygon.length;
  const points = polygon.map(([lng, lat]) => [
    EARTH_RADIUS_M * lng * toRad * Math.cos(lat0 * toRad),
    EARTH_RADIUS_M * lat * toRad,
  ]);

  let twiceArea = 0;
  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length]!;
    twiceArea += x1! * y2! - x2! * y1!;
  });

  return Math.abs(twiceArea) / 2 / 10_000;
}

export function formatArea(ha: number): string {
  return ha < 1
    ? `${Math.round(ha * 10_000).toLocaleString()} m²`
    : `${ha.toFixed(2)} ha`;
}
