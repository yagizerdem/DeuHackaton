import { Play, Route, Square } from "lucide-react";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { routeLengthKm, type TourStop } from "@/lib/map3d/tour";
import { cn } from "@/lib/utils";

interface TourControlsProps {
  stops: TourStop[];
  showRoute: boolean;
  running: boolean;
  activeIndex: number | null;
  onShowRouteChange: (show: boolean) => void;
  onStart: () => void;
  onStop: () => void;
}

export default function TourControls({
  stops,
  showRoute,
  running,
  activeIndex,
  onShowRouteChange,
  onStart,
  onStop,
}: TourControlsProps) {
  if (stops.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Bugün için konumlu bir bitkide bekleyen görev yok. Görevlere bir bitki ata, tur
        otomatik oluşur.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="tour-route"
          checked={showRoute}
          onCheckedChange={onShowRouteChange}
        />
        <label htmlFor="tour-route" className="text-sm">
          Rotayı göster
          <span className="block text-xs text-muted-foreground">
            {stops.length} durak
            {stops.length > 1 && ` · yaklaşık ${routeLengthKm(stops).toFixed(2)} km`}
          </span>
        </label>
      </div>

      <ol className="space-y-1 text-xs">
        {stops.map((stop, i) => (
          <li
            key={stop.plantId}
            className={cn(
              "rounded-md border px-2 py-1",
              activeIndex === i ? "border-amber-500 bg-amber-500/10" : "border-border/50",
            )}
            aria-current={activeIndex === i ? "step" : undefined}
          >
            <span className="font-medium">
              {i + 1}. {stop.plantName}
            </span>
            <span className="block text-muted-foreground">{stop.tasks.join(", ")}</span>
          </li>
        ))}
      </ol>

      {running ? (
        <Button variant="outline" size="sm" onClick={onStop}>
          <Square />
          Turu durdur
        </Button>
      ) : (
        <Button size="sm" onClick={onStart}>
          <Play />
          Sabah turunu oynat
        </Button>
      )}
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Route className="size-3" aria-hidden />
        Duraklar en yakın komşu sırasıyla dizilir.
      </p>
    </div>
  );
}
