import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { addDays, fetchBurntAreas } from "@lib/gwis";
import { today } from "@lib/utils";
import { distanceKm } from "@/lib/map3d/geometry";
import type { MapCenter } from "@/lib/invasive-species-api";

const LOOKBACK_DAYS = 30;
const KM_PER_DEG = 111.32;

interface FireSummaryProps {
  center: MapCenter;
  radiusKm: number;
}

// Burnt areas of the last month inside the analysis radius, and how far the
// nearest one is from the analysed point.
export default function FireSummary({ center, radiusKm }: FireSummaryProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["near-burnt", center.lat.toFixed(3), center.lng.toFixed(3), radiusKm],
    queryFn: async ({ signal }) => {
      const dLat = radiusKm / KM_PER_DEG;
      const dLng = radiusKm / (KM_PER_DEG * Math.cos((center.lat * Math.PI) / 180));
      const areas = await fetchBurntAreas(
        [center.lat - dLat, center.lng - dLng, center.lat + dLat, center.lng + dLng],
        addDays(today(), -LOOKBACK_DAYS),
        today(),
        signal,
      );
      return areas
        .map((area) => {
          const [south, west, north, east] = area.bounds;
          return {
            ...area,
            distanceKm: distanceKm(center, {
              lat: (south + north) / 2,
              lng: (west + east) / 2,
            }),
          };
        })
        .filter((area) => area.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  if (isPending) return <p className="text-xs text-muted-foreground">Yanmış alanlar aranıyor…</p>;
  if (isError) {
    return <p role="alert" className="text-xs text-destructive">Yangın verisi alınamadı.</p>;
  }
  if (data.length === 0) {
    return (
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Flame className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Son {LOOKBACK_DAYS} günde {radiusKm} km içinde yanmış alan yok.
      </p>
    );
  }

  const nearest = data[0]!;
  return (
    <p className="flex items-start gap-2 text-xs">
      <Flame className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden />
      <span>
        Son {LOOKBACK_DAYS} günde {data.length} yanmış alan. En yakını{" "}
        <strong>{nearest.distanceKm.toFixed(1)} km</strong> uzakta ({nearest.areaHa} ha,{" "}
        {nearest.startDate.slice(0, 10)}).
      </span>
    </p>
  );
}
