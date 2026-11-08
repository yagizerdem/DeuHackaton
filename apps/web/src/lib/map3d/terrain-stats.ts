import { polygonAreaHa } from "@/lib/geo";
import {
  centroidOf,
  fromLocalMeters,
  perimeterM,
  pointInPolygon,
  toLocalMeters,
  type LatLng,
  type LngLat,
} from "@/lib/map3d/geometry";

/** Elevation in meters above sea level for every point, in the same order. */
export type ElevationSampler = (points: LatLng[]) => Promise<number[]>;

// The DEMs behind the elevation sources are 30-90 m grids, a small parcel sits
// inside one cell. Slope and aspect are read from the surroundings instead.
const MIN_WINDOW_M = 300;
const GRID = 5;
const FLAT_BELOW_DEG = 2;

const DIRECTIONS = [
  "Kuzey",
  "Kuzeydoğu",
  "Doğu",
  "Güneydoğu",
  "Güney",
  "Güneybatı",
  "Batı",
  "Kuzeybatı",
];

export const aspectLabel = (aspectDeg: number) =>
  DIRECTIONS[Math.round((((aspectDeg % 360) + 360) % 360) / 45) % 8]!;

interface Sample {
  x: number;
  y: number;
  z: number;
}

/** Least squares plane z = a·x + b·y + c, null when the points are degenerate. */
export function fitPlane(samples: Sample[]) {
  const n = samples.length;
  if (n < 3) return null;

  let sxx = 0, sxy = 0, sx = 0, syy = 0, sy = 0, sxz = 0, syz = 0, sz = 0;
  for (const { x, y, z } of samples) {
    sxx += x * x; sxy += x * y; sx += x;
    syy += y * y; sy += y;
    sxz += x * z; syz += y * z; sz += z;
  }

  // Cramer's rule on the 3x3 normal equations
  const det3 = (m: number[][]) =>
    m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
    m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
    m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!);
  const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]];
  const det = det3(A);
  if (Math.abs(det) < 1e-9) return null;

  const withColumn = (col: number, values: number[]) =>
    A.map((row, r) => row.map((v, c) => (c === col ? values[r]! : v)));
  const rhs = [sxz, syz, sz];
  return {
    a: det3(withColumn(0, rhs)) / det,
    b: det3(withColumn(1, rhs)) / det,
    c: det3(withColumn(2, rhs)) / det,
  };
}

/** Slope in degrees and the compass bearing the slope faces (null when flat). */
export function slopeAndAspect(plane: { a: number; b: number }) {
  const slopeDeg = (Math.atan(Math.hypot(plane.a, plane.b)) * 180) / Math.PI;
  if (slopeDeg < FLAT_BELOW_DEG) return { slopeDeg, aspectDeg: null };
  // the downhill direction is (-a, -b), measured clockwise from north
  const aspectDeg = ((Math.atan2(-plane.a, -plane.b) * 180) / Math.PI + 360) % 360;
  return { slopeDeg, aspectDeg };
}

/** What the terrain means for plants, northern hemisphere. */
export function interpretTerrain(
  slopeDeg: number,
  aspectDeg: number | null,
): string[] {
  if (aspectDeg === null) {
    return [
      "Arazi düze yakın. Yağış ve sulama suyu birikebilir, drenajı kontrol et.",
    ];
  }
  const lines: string[] = [];
  const label = aspectLabel(aspectDeg);
  if (aspectDeg >= 112.5 && aspectDeg < 247.5) {
    lines.push(
      `Yamaç ${label.toLocaleLowerCase("tr")} yöne bakıyor: daha çok güneş alır, toprak çabuk kurur. Kuraklık stresi riski yüksek.`,
    );
  } else if (aspectDeg >= 292.5 || aspectDeg < 67.5) {
    lines.push(
      `Yamaç ${label.toLocaleLowerCase("tr")} yöne bakıyor: daha serin ve nemli kalır. Mantar hastalıkları için nem riskine dikkat et.`,
    );
  } else {
    lines.push(
      `Yamaç ${label.toLocaleLowerCase("tr")} yöne bakıyor: güneş alımı orta düzeyde.`,
    );
  }
  if (slopeDeg >= 15) {
    lines.push("Eğim dik: yüzey akışı ve toprak erozyonu riski var.");
  } else if (slopeDeg >= 8) {
    lines.push("Eğim orta: yağışta yüzey akışına dikkat et.");
  }
  return lines;
}

export interface TerrainAnalysis {
  areaHa: number;
  perimeterM: number;
  centroid: LatLng;
  elevation: { minM: number; maxM: number; meanM: number };
  slopeDeg: number;
  aspectDeg: number | null;
  aspect: string | null;
  /** side of the square the slope was read from */
  windowM: number;
  interpretation: string[];
}

export async function analyzeTerrainArea(
  polygon: LngLat[],
  sample: ElevationSampler,
): Promise<TerrainAnalysis> {
  const centroid = centroidOf(polygon);
  const local = polygon.map(([lng, lat]) => toLocalMeters(centroid, { lat, lng }));
  const extent = Math.max(
    ...local.map((p) => Math.abs(p.x)),
    ...local.map((p) => Math.abs(p.y)),
  ) * 2;
  const windowM = Math.max(extent, MIN_WINDOW_M);

  const grid: LatLng[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x = ((col / (GRID - 1)) - 0.5) * windowM;
      const y = ((row / (GRID - 1)) - 0.5) * windowM;
      grid.push(fromLocalMeters(centroid, x, y));
    }
  }
  const corners = polygon.map(([lng, lat]) => ({ lat, lng }));

  const heights = await sample([...grid, ...corners]);
  const gridHeights = heights.slice(0, grid.length);
  const cornerHeights = heights.slice(grid.length);

  const plane = fitPlane(
    grid.map((point, i) => ({ ...toLocalMeters(centroid, point), z: gridHeights[i]! })),
  );
  const { slopeDeg, aspectDeg } = plane
    ? slopeAndAspect(plane)
    : { slopeDeg: 0, aspectDeg: null };

  // the elevation range is the parcel's own: corners plus grid points inside it
  const inside = gridHeights.filter((_, i) => pointInPolygon(grid[i]!, polygon));
  const own = [...cornerHeights, ...inside];
  const sum = own.reduce((a, b) => a + b, 0);

  return {
    areaHa: polygonAreaHa(polygon),
    perimeterM: perimeterM(polygon),
    centroid,
    elevation: {
      minM: Math.round(Math.min(...own)),
      maxM: Math.round(Math.max(...own)),
      meanM: Math.round(sum / own.length),
    },
    slopeDeg: Math.round(slopeDeg * 10) / 10,
    aspectDeg: aspectDeg === null ? null : Math.round(aspectDeg),
    aspect: aspectDeg === null ? null : aspectLabel(aspectDeg),
    windowM: Math.round(windowM),
    interpretation: interpretTerrain(slopeDeg, aspectDeg),
  };
}

