import { useEffect, useMemo, useState } from "react";
import { useViewer } from "@components/map3d/viewer-context";
import { hasRealTerrain, sampleViewerTerrain } from "@/lib/map3d/elevation";
import type { LatLng } from "@/lib/map3d/geometry";

interface Sampled {
  points: LatLng[];
  heights: number[];
}

/**
 * Terrain height under every point, in meters. Layers add their own offset on
 * top, so they stay above the hills. The heights are 0 while terrain is still
 * loading or when the globe is flat, and they refresh when the terrain changes.
 * `points` must keep the same identity between renders (useMemo).
 */
export function useGroundHeights(points: LatLng[]): number[] {
  const viewer = useViewer();
  const [sampled, setSampled] = useState<Sampled | null>(null);
  const [terrainVersion, setTerrainVersion] = useState(0);

  useEffect(() => {
    const remove = viewer.scene.globe.terrainProviderChanged.addEventListener(
      () => setTerrainVersion((v) => v + 1),
    );
    return () => {
      remove();
    };
  }, [viewer]);

  useEffect(() => {
    if (points.length === 0) return;
    let cancelled = false;

    const provider = viewer.terrainProvider;
    const heights = hasRealTerrain(provider)
      ? sampleViewerTerrain(provider, points).catch(() => points.map(() => 0))
      : Promise.resolve(points.map(() => 0));
    void heights.then((result) => {
      if (!cancelled) setSampled({ points, heights: result });
    });

    return () => {
      cancelled = true;
    };
  }, [viewer, points, terrainVersion]);

  // a stable array, effects further down depend on its identity
  const zeros = useMemo(() => points.map(() => 0), [points]);
  return sampled?.points === points ? sampled.heights : zeros;
}
