import { AppError } from "@utils/app-error.js";
import {
  CLC_CLASSES,
  GROUP_LABELS,
  type LandCoverGroup,
} from "@services/vegetation/clc-classes.js";

// All sources are free and need no key.
const CLC_URL =
  "https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_WM/MapServer/0/query";
const CLC_YEAR = 2018;
const GBIF_URL = "https://api.gbif.org/v1/occurrence/search";
const ELEVATION_URL = "https://api.open-meteo.com/v1/elevation";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

const TIMEOUT_MS = 20_000;
const KM_PER_DEG = 111.32;
// sample points per side of the bounding box, the circle keeps about 78% of them
const SAMPLE_GRID = 41;
const SPECIES_LIMIT = 15;
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 200;

export interface LandCoverClassShare {
  code: string;
  label: string;
  group: LandCoverGroup;
  vegetated: boolean;
  percent: number;
}

export interface LandCoverGroupShare {
  group: LandCoverGroup;
  label: string;
  percent: number;
}

export interface VegetationAnalysis {
  location: { lat: number; lon: number; radiusKm: number };
  landCover: {
    source: string;
    year: number;
    /** share of the searched circle that CORINE has data for */
    coveragePercent: number;
    /** share of the mapped area that is vegetated (crops included) */
    vegetationPercent: number;
    classes: LandCoverClassShare[];
    groups: LandCoverGroupShare[];
  } | null;
  species: {
    source: string;
    totalOccurrences: number;
    items: { name: string; count: number }[];
  } | null;
  terrain: { elevationM: number } | null;
  climate: { year: number; meanTempC: number; annualPrecipMm: number } | null;
  summary: string[];
  /** data sources that could not be reached */
  unavailable: string[];
}

type Bounds = { west: number; east: number; south: number; north: number };
type Ring = number[][];
type ClcFeature = {
  attributes: { Code_18: string };
  geometry?: { rings: Ring[] };
};

async function getJson<T>(
  url: string,
  params: Record<string, string | number>,
): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  const response = await fetch(`${url}?${query}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${new URL(url).host} responded ${response.status}`);
  }
  return (await response.json()) as T;
}

function boundsAround(lat: number, lon: number, radiusKm: number): Bounds {
  const dLat = radiusKm / KM_PER_DEG;
  const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
  const dLon = radiusKm / (KM_PER_DEG * cosLat);
  return {
    west: lon - dLon,
    east: lon + dLon,
    south: lat - dLat,
    north: lat + dLat,
  };
}

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

// even-odd rule over all rings, so holes in a polygon are handled too
function insideRings(x: number, y: number, rings: Ring[]): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]!;
      const [xj, yj] = ring[j]!;
      if (yi! > y !== yj! > y && x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function ringsBounds(rings: Ring[]): Bounds {
  let west = Infinity;
  let east = -Infinity;
  let south = Infinity;
  let north = -Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring) {
      west = Math.min(west, x!);
      east = Math.max(east, x!);
      south = Math.min(south, y!);
      north = Math.max(north, y!);
    }
  }
  return { west, east, south, north };
}

/**
 * CORINE polygons overlap the box but not only the circle, so the composition is
 * estimated by testing a grid of points against the polygons.
 */
async function fetchLandCover(
  lat: number,
  lon: number,
  radiusKm: number,
  bounds: Bounds,
): Promise<VegetationAnalysis["landCover"]> {
  const data = await getJson<{ features?: ClcFeature[]; error?: unknown }>(
    CLC_URL,
    {
      f: "json",
      geometry: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
      geometryType: "esriGeometryEnvelope",
      inSR: 4326,
      outSR: 4326,
      spatialRel: "esriSpatialRelIntersects",
      outFields: "Code_18",
      returnGeometry: "true",
      // generalize vertices, the grid is far coarser than this
      maxAllowableOffset: (bounds.north - bounds.south) / 80,
    },
  );
  if (data.error || !data.features) throw new Error("CORINE query failed");

  const polygons = data.features
    .filter((f) => f.geometry?.rings.length && CLC_CLASSES[f.attributes.Code_18])
    .map((f) => ({
      code: f.attributes.Code_18,
      rings: f.geometry!.rings,
      box: ringsBounds(f.geometry!.rings),
    }));

  const cosLat = Math.cos((lat * Math.PI) / 180);
  const counts = new Map<string, number>();
  let sampled = 0;
  let matched = 0;

  for (let gy = 0; gy < SAMPLE_GRID; gy++) {
    for (let gx = 0; gx < SAMPLE_GRID; gx++) {
      const x = bounds.west + ((gx + 0.5) / SAMPLE_GRID) * (bounds.east - bounds.west);
      const y = bounds.south + ((gy + 0.5) / SAMPLE_GRID) * (bounds.north - bounds.south);
      const dxKm = (x - lon) * cosLat * KM_PER_DEG;
      const dyKm = (y - lat) * KM_PER_DEG;
      if (dxKm * dxKm + dyKm * dyKm > radiusKm * radiusKm) continue;

      sampled++;
      const polygon = polygons.find(
        (p) =>
          x >= p.box.west &&
          x <= p.box.east &&
          y >= p.box.south &&
          y <= p.box.north &&
          insideRings(x, y, p.rings),
      );
      if (!polygon) continue;
      matched++;
      counts.set(polygon.code, (counts.get(polygon.code) ?? 0) + 1);
    }
  }

  // outside Europe or over open sea, which is an answer and not a failure
  if (matched === 0) return null;

  // round only for display, so groups and the total still add up
  const shares = [...counts.entries()]
    .map(([code, n]) => ({ code, ...CLC_CLASSES[code]!, share: (n / matched) * 100 }))
    .sort((a, b) => b.share - a.share);

  const groupTotals = new Map<LandCoverGroup, number>();
  for (const cls of shares) {
    groupTotals.set(cls.group, (groupTotals.get(cls.group) ?? 0) + cls.share);
  }

  return {
    source: "CORINE Land Cover",
    year: CLC_YEAR,
    coveragePercent: round((matched / sampled) * 100),
    vegetationPercent: round(
      shares.filter((cls) => cls.vegetated).reduce((sum, cls) => sum + cls.share, 0),
    ),
    classes: shares.map(({ share, ...cls }) => ({ ...cls, percent: round(share) })),
    groups: [...groupTotals.entries()]
      .map(([group, share]) => ({
        group,
        label: GROUP_LABELS[group],
        percent: round(share),
      }))
      .sort((a, b) => b.percent - a.percent),
  };
}

async function fetchSpecies(
  bounds: Bounds,
): Promise<NonNullable<VegetationAnalysis["species"]>> {
  const { west, east, south, north } = bounds;
  const data = await getJson<{
    count: number;
    facets: { counts: { name: string; count: number }[] }[];
  }>(GBIF_URL, {
    kingdomKey: 6, // Plantae
    // GBIF wants a counter-clockwise exterior ring
    geometry: `POLYGON((${west} ${south},${east} ${south},${east} ${north},${west} ${north},${west} ${south}))`,
    occurrenceStatus: "PRESENT",
    limit: 0,
    facet: "scientificName",
    facetLimit: SPECIES_LIMIT,
  });
  return {
    source: "GBIF",
    totalOccurrences: data.count,
    items: (data.facets[0]?.counts ?? []).map(({ name, count }) => ({ name, count })),
  };
}

async function fetchElevation(lat: number, lon: number) {
  const data = await getJson<{ elevation: number[] }>(ELEVATION_URL, {
    latitude: lat,
    longitude: lon,
  });
  const elevationM = data.elevation[0];
  if (elevationM === undefined) throw new Error("No elevation returned");
  return { elevationM: Math.round(elevationM) };
}

// last full calendar year, so the figures describe a complete seasonal cycle
async function fetchClimate(lat: number, lon: number) {
  const year = new Date().getFullYear() - 1;
  const data = await getJson<{
    daily: {
      temperature_2m_mean: (number | null)[];
      precipitation_sum: (number | null)[];
    };
  }>(ARCHIVE_URL, {
    latitude: lat,
    longitude: lon,
    start_date: `${year}-01-01`,
    end_date: `${year}-12-31`,
    daily: "temperature_2m_mean,precipitation_sum",
    timezone: "auto",
  });
  const temps = data.daily.temperature_2m_mean.filter((v): v is number => v !== null);
  const rain = data.daily.precipitation_sum.filter((v): v is number => v !== null);
  if (temps.length < 300) throw new Error("Not enough climate data");
  return {
    year,
    meanTempC: round(temps.reduce((a, b) => a + b, 0) / temps.length),
    annualPrecipMm: Math.round(rain.reduce((a, b) => a + b, 0)),
  };
}

function buildSummary(
  a: Omit<VegetationAnalysis, "summary" | "unavailable">,
  landCoverFailed: boolean,
) {
  const lines: string[] = [];
  const { landCover, species, terrain, climate } = a;

  if (landCover) {
    const [top] = landCover.classes;
    lines.push(
      landCover.vegetationPercent < 1
        ? "Bölgede belirgin bir bitki örtüsü yok."
        : `Bölgenin yaklaşık %${landCover.vegetationPercent}'i bitki örtüsüyle kaplı (tarım alanları dahil).`,
    );
    if (top) {
      lines.push(`Baskın arazi örtüsü: ${top.label} (%${top.percent}).`);
    }
    const forest = landCover.classes.filter((cls) => cls.group === "forest");
    const forestTotal = forest.reduce((sum, cls) => sum + cls.percent, 0);
    if (forestTotal >= 5) {
      const parts = forest.map((cls) => `${cls.label.toLocaleLowerCase("tr")} %${cls.percent}`);
      lines.push(`Ormanlık alanın dağılımı: ${parts.join(", ")}.`);
    }
    const artificial = landCover.groups.find((g) => g.group === "artificial");
    if (artificial && artificial.percent >= 20) {
      lines.push(`Alanın %${artificial.percent}'i yapay yüzey, bitki örtüsü parçalı olabilir.`);
    }
  }

  if (!landCover && !landCoverFailed) {
    lines.push(
      "Bu konum arazi örtüsü verisinin (CORINE: Avrupa ve Türkiye) kapsamı dışında veya açık deniz.",
    );
  }

  if (species) {
    lines.push(
      species.totalOccurrences === 0
        ? "GBIF'te bu alan için bitki gözlemi kaydı bulunamadı."
        : `GBIF'te bu alanda ${species.totalOccurrences} bitki gözlemi kayıtlı; en sık gözlenenler: ${species.items
            .slice(0, 3)
            .map((s) => `${s.name} (${s.count})`)
            .join(", ")}.`,
    );
  }

  const setting: string[] = [];
  if (terrain) setting.push(`rakım ${terrain.elevationM} m`);
  if (climate) {
    setting.push(
      `${climate.year} yılı ortalama sıcaklık ${climate.meanTempC} °C, yıllık yağış ${climate.annualPrecipMm} mm`,
    );
  }
  if (setting.length) lines.push(`Bölgenin koşulları: ${setting.join("; ")}.`);

  return lines;
}

const cache = new Map<string, { expires: number; value: VegetationAnalysis }>();

export async function analyzeVegetation(
  lat: number,
  lon: number,
  radiusKm: number,
): Promise<VegetationAnalysis> {
  // ~100 m grid, nearby clicks share the same answer
  const key = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;

  const bounds = boundsAround(lat, lon, radiusKm);
  const names = ["CORINE", "GBIF", "Open-Meteo yükseklik", "Open-Meteo iklim"];
  const results = await Promise.allSettled([
    fetchLandCover(lat, lon, radiusKm, bounds),
    fetchSpecies(bounds),
    fetchElevation(lat, lon),
    fetchClimate(lat, lon),
  ]);

  const unavailable: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") return;
    unavailable.push(names[i]!);
    console.error(`Vegetation source ${names[i]} failed:`, result.reason);
  });
  if (unavailable.length === results.length) {
    throw AppError.serviceUnavailable("Vegetation data sources are unreachable");
  }

  const [landCover, species, terrain, climate] = results.map((r) =>
    r.status === "fulfilled" ? r.value : null,
  ) as [
    VegetationAnalysis["landCover"],
    VegetationAnalysis["species"],
    VegetationAnalysis["terrain"],
    VegetationAnalysis["climate"],
  ];

  const base = {
    location: { lat, lon, radiusKm },
    landCover,
    species,
    terrain,
    climate,
  };
  const value: VegetationAnalysis = {
    ...base,
    summary: buildSummary(base, unavailable.includes("CORINE")),
    unavailable,
  };

  // a partial answer would stay wrong for an hour
  if (unavailable.length === 0) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
  }
  return value;
}
