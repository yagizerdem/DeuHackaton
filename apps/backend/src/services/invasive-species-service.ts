import type {
  InvasiveObservationDto,
  InvasiveSpeciesMapDto,
} from "@DeparkHackaton/dto";
import { AppError } from "@utils/app-error.js";

const GBIF_URL = "https://api.gbif.org/v1/occurrence/search";
const TIMEOUT_MS = 20_000;
const KM_PER_DEG = 111.32;
const EARTH_RADIUS_KM = 6371;

const PAGE_SIZE = 300;
const MAX_PAGES = 3;
// records older than this say little about the threat today
const FIRST_YEAR = 1990;
// a record with a worse coordinate precision cannot be placed on a farm map
const MAX_UNCERTAINTY_M = 5000;
const POLYGON_SIDES = 36;

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 200;

// GBIF's establishmentMeans filter is empty for most of Türkiye, so the threats
// are listed by name. Plant pests and invasive plants relevant to Mediterranean
// farms and gardens, matched against the GBIF backbone taxonomy.
export const INVASIVE_SPECIES = [
  "Anoplophora chinensis",
  "Anoplophora glabripennis",
  "Bactrocera dorsalis",
  "Ceratitis capitata",
  "Corythucha ciliata",
  "Cydalima perspectalis",
  "Drosophila suzukii",
  "Halyomorpha halys",
  "Paysandisia archon",
  "Popillia japonica",
  "Rhynchophorus ferrugineus",
  "Tuta absoluta",
  "Xylella fastidiosa",
  "Xylosandrus germanus",
  "Acacia dealbata",
  "Ailanthus altissima",
  "Ambrosia artemisiifolia",
  "Lantana camara",
  "Opuntia ficus-indica",
  "Robinia pseudoacacia",
  "Solanum elaeagnifolium",
] as const;

interface GbifOccurrence {
  key: number;
  species?: string;
  year?: number;
  decimalLatitude?: number;
  decimalLongitude?: number;
  coordinateUncertaintyInMeters?: number;
}

interface GbifPage {
  count: number;
  endOfRecords: boolean;
  results: GbifOccurrence[];
}

const cache = new Map<string, { at: number; value: InvasiveSpeciesMapDto }>();

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// GBIF wants a counter-clockwise exterior ring, a circle approximated by a polygon
function circleWkt(lat: number, lng: number, radiusKm: number) {
  const dLat = radiusKm / KM_PER_DEG;
  const dLng = radiusKm / (KM_PER_DEG * Math.cos((lat * Math.PI) / 180));
  const points = Array.from({ length: POLYGON_SIDES }, (_, i) => {
    const angle = (2 * Math.PI * i) / POLYGON_SIDES;
    return `${round(lng + dLng * Math.cos(angle), 5)} ${round(lat + dLat * Math.sin(angle), 5)}`;
  });
  return `POLYGON((${[...points, points[0]].join(",")}))`;
}

async function fetchPage(
  geometry: string,
  offset: number,
  year: string,
): Promise<GbifPage> {
  const params = new URLSearchParams({
    geometry,
    year,
    hasCoordinate: "true",
    hasGeospatialIssue: "false",
    occurrenceStatus: "PRESENT",
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  for (const name of INVASIVE_SPECIES) params.append("scientificName", name);

  let response: Response;
  try {
    response = await fetch(`${GBIF_URL}?${params}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw AppError.serviceUnavailable("GBIF is unreachable");
  }
  if (!response.ok) throw AppError.serviceUnavailable("GBIF query failed");
  return (await response.json()) as GbifPage;
}

export async function findInvasiveSpecies(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<InvasiveSpeciesMapDto> {
  // the key rounds to about 100 m, so nearby clicks share one GBIF request
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  const geometry = circleWkt(lat, lng, radiusKm);
  const year = `${FIRST_YEAR},${new Date().getFullYear()}`;

  const raw: GbifOccurrence[] = [];
  let truncated = false;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await fetchPage(geometry, page * PAGE_SIZE, year);
    raw.push(...data.results);
    if (data.endOfRecords) break;
    truncated = page === MAX_PAGES - 1;
  }

  const observations: InvasiveObservationDto[] = [];
  for (const o of raw) {
    if (
      !o.species ||
      !o.year ||
      o.decimalLatitude === undefined ||
      o.decimalLongitude === undefined ||
      (o.coordinateUncertaintyInMeters ?? 0) > MAX_UNCERTAINTY_M
    ) {
      continue;
    }
    const km = distanceKm(lat, lng, o.decimalLatitude, o.decimalLongitude);
    // the polygon is only an approximation of the circle
    if (km > radiusKm) continue;
    observations.push({
      id: String(o.key),
      species: o.species,
      year: o.year,
      lat: o.decimalLatitude,
      lng: o.decimalLongitude,
      distanceKm: round(km, 2),
    });
  }
  observations.sort((a, b) => a.distanceKm - b.distanceKm);

  const bySpecies = new Map<string, { count: number; nearestKm: number }>();
  for (const o of observations) {
    const entry = bySpecies.get(o.species);
    if (entry) entry.count++;
    else bySpecies.set(o.species, { count: 1, nearestKm: o.distanceKm });
  }

  const years = observations.map((o) => o.year);
  const value: InvasiveSpeciesMapDto = {
    center: { lat, lng },
    radiusKm,
    observations,
    // observations are sorted by distance, so the first hit per species is its nearest
    species: [...bySpecies].map(([species, v]) => ({ species, ...v })),
    nearest: observations[0] ?? null,
    yearRange: years.length
      ? { min: Math.min(...years), max: Math.max(...years) }
      : null,
    truncated,
    source: "GBIF",
  };

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value });
  return value;
}
