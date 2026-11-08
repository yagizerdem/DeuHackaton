import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@components/ui/skeleton";
import { useViewer } from "@components/map3d/viewer-context";
import { createElevationSampler, hasRealTerrain } from "@/lib/map3d/elevation";
import type { LngLat } from "@/lib/map3d/geometry";
import { analyzeTerrainArea } from "@/lib/map3d/terrain-stats";

/** Elevation, slope and aspect of a polygon, read from the globe's terrain. */
export function useTerrainAnalysis(polygon: LngLat[] | null) {
  const viewer = useViewer();
  const sampler = useMemo(() => createElevationSampler(viewer), [viewer]);
  const real = hasRealTerrain(viewer.terrainProvider);

  return useQuery({
    queryKey: ["terrain-analysis", polygon, real],
    queryFn: () => analyzeTerrainArea(polygon!, sampler),
    enabled: polygon !== null,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default function TerrainSummary({ polygon }: { polygon: LngLat[] }) {
  const viewer = useViewer();
  const { data, isPending, isError } = useTerrainAnalysis(polygon);

  if (isPending) return <Skeleton className="h-24" role="status" aria-label="Arazi analiz ediliyor" />;
  if (isError) {
    return <p role="alert" className="text-xs text-destructive">Arazi verisi alınamadı.</p>;
  }

  return (
    <div className="space-y-2">
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border bg-muted/40 p-2">
          <dt className="text-[11px] text-muted-foreground">Rakım</dt>
          <dd className="text-sm font-semibold">
            {data.elevation.minM === data.elevation.maxM
              ? `${data.elevation.meanM} m`
              : `${data.elevation.minM}–${data.elevation.maxM} m`}
          </dd>
        </div>
        <div className="rounded-md border bg-muted/40 p-2">
          <dt className="text-[11px] text-muted-foreground">Eğim</dt>
          <dd className="text-sm font-semibold">{data.slopeDeg}°</dd>
        </div>
        <div className="rounded-md border bg-muted/40 p-2">
          <dt className="text-[11px] text-muted-foreground">Bakı</dt>
          <dd className="text-sm font-semibold">{data.aspect ?? "Düz"}</dd>
        </div>
      </dl>
      <ul className="list-disc space-y-1 pl-4 text-xs text-foreground">
        {data.interpretation.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Eğim ve bakı, çevredeki {data.windowM} m'lik alandan okundu.{" "}
        {hasRealTerrain(viewer.terrainProvider)
          ? "Veri: Cesium World Terrain."
          : "Veri: Open-Meteo (yaklaşık 90 m çözünürlük)."}
      </p>
    </div>
  );
}
