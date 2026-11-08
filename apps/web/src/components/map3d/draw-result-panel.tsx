import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/skeleton";
import TerrainSummary, { useTerrainAnalysis } from "@components/map3d/terrain-summary";
import { formatArea } from "@/lib/geo";
import { useCreateParcel } from "@/lib/farm-api";
import { centroidOf, radiusM, type LngLat } from "@/lib/map3d/geometry";
import { fetchVegetation } from "@/lib/vegetation-api";

// the vegetation endpoint reads a circle, so it covers the area and a bit more
const MIN_RADIUS_KM = 0.1;
const MAX_RADIUS_KM = 5;

interface DrawResultPanelProps {
  polygon: LngLat[];
  onClear: () => void;
  onSaved: () => void;
}

// Everything that can be known about a freshly drawn area: size, elevation,
// slope, aspect and what grows around it. It can be saved as a parcel.
export default function DrawResultPanel({
  polygon,
  onClear,
  onSaved,
}: DrawResultPanelProps) {
  const [name, setName] = useState("");
  const createParcel = useCreateParcel();
  const terrain = useTerrainAnalysis(polygon);

  const center = centroidOf(polygon);
  const radiusKm = Math.min(
    MAX_RADIUS_KM,
    Math.max(MIN_RADIUS_KM, Math.round((radiusM(polygon, center) * 1.2) / 10) / 100),
  );
  const vegetation = useQuery({
    queryKey: ["draw-vegetation", polygon],
    queryFn: ({ signal }) => fetchVegetation(center.lat, center.lng, signal, radiusKm),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createParcel.mutate(
      { name: name.trim(), kind: "field", polygon },
      { onSuccess: onSaved },
    );
  }

  return (
    <aside className="absolute right-3 top-3 z-10 max-h-[calc(100%-1.5rem)] w-80 max-w-[calc(100%-1.5rem)] space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-card/95 p-4 text-sm shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-stitch-headline text-stitch-headline-sm text-foreground">
          Çizilen alan
        </h2>
        <Button variant="ghost" size="icon-xs" aria-label="Alanı temizle" onClick={onClear}>
          <X />
        </Button>
      </div>

      {terrain.data && (
        <p className="text-xs text-muted-foreground">
          {formatArea(terrain.data.areaHa)} · çevre {Math.round(terrain.data.perimeterM)} m ·{" "}
          {polygon.length} köşe
        </p>
      )}
      <TerrainSummary polygon={polygon} />

      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Arazi örtüsü
        </h3>
        {vegetation.isPending ? (
          <Skeleton className="h-20" role="status" aria-label="Arazi örtüsü analiz ediliyor" />
        ) : vegetation.isError ? (
          <p role="alert" className="text-xs text-destructive">Arazi örtüsü alınamadı.</p>
        ) : vegetation.data.landCover ? (
          <div className="space-y-1.5 text-xs">
            <p>
              {vegetation.data.landCover.vegetationPercent < 1 ? (
                "Çevrede belirgin bir bitki örtüsü yok."
              ) : (
                <>
                  Çevrenin yaklaşık{" "}
                  <strong>%{vegetation.data.landCover.vegetationPercent}</strong>'i bitki
                  örtüsüyle kaplı.
                </>
              )}
            </p>
            <ul className="space-y-0.5">
              {vegetation.data.landCover.classes.slice(0, 4).map((c) => (
                <li key={c.code} className="flex justify-between gap-2">
                  <span>{c.label}</span>
                  <span className="tabular-nums text-muted-foreground">%{c.percent}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground">
              CORINE 2018, alanı çevreleyen {radiusKm} km'lik daire.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Bu konum arazi örtüsü verisinin (Avrupa ve Türkiye) kapsamı dışında.
          </p>
        )}
      </div>

      <form onSubmit={save} className="space-y-2 border-t pt-3">
        <Input
          value={name}
          maxLength={80}
          placeholder="Parsel adı"
          aria-label="Parsel adı"
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={!name.trim() || createParcel.isPending}>
          Parsel olarak kaydet
        </Button>
      </form>
    </aside>
  );
}
