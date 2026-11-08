import {
  Cartographic,
  EllipsoidTerrainProvider,
  sampleTerrain,
  sampleTerrainMostDetailed,
  type TerrainProvider,
  type Viewer,
} from "cesium";
import type { LatLng } from "@/lib/map3d/geometry";
import type { ElevationSampler } from "@/lib/map3d/terrain-stats";

const OPEN_METEO = "https://api.open-meteo.com/v1/elevation";
const OPEN_METEO_BATCH = 100;
const FALLBACK_LEVEL = 11;

export const hasRealTerrain = (provider: TerrainProvider) =>
  !(provider instanceof EllipsoidTerrainProvider);

/** Heights of the terrain the viewer shows, in meters. Needs real terrain. */
export async function sampleViewerTerrain(
  provider: TerrainProvider,
  points: LatLng[],
): Promise<number[]> {
  const positions = points.map((p) => Cartographic.fromDegrees(p.lng, p.lat));
  // sampleTerrainMostDetailed needs tile availability, procedural providers have none
  await (provider.availability
    ? sampleTerrainMostDetailed(provider, positions)
    : sampleTerrain(provider, FALLBACK_LEVEL, positions));
  return positions.map((p) => p.height ?? 0);
}

/** Free elevation service, used while the globe has no terrain of its own. */
export async function openMeteoElevations(
  points: LatLng[],
  signal?: AbortSignal,
): Promise<number[]> {
  const heights: number[] = [];
  for (let i = 0; i < points.length; i += OPEN_METEO_BATCH) {
    const batch = points.slice(i, i + OPEN_METEO_BATCH);
    const query = new URLSearchParams({
      latitude: batch.map((p) => p.lat.toFixed(5)).join(","),
      longitude: batch.map((p) => p.lng.toFixed(5)).join(","),
    });
    const response = await fetch(`${OPEN_METEO}?${query}`, { signal });
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
    const data = (await response.json()) as { elevation: number[] };
    heights.push(...data.elevation);
  }
  return heights;
}

/** Cesium terrain when the globe has it, Open-Meteo otherwise. */
export function createElevationSampler(viewer: Viewer): ElevationSampler {
  return (points) =>
    hasRealTerrain(viewer.terrainProvider)
      ? sampleViewerTerrain(viewer.terrainProvider, points)
      : openMeteoElevations(points);
}
