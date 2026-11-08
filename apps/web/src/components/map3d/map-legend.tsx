import { cn } from "@/lib/utils";
import {
  EXTRUDE_BASE_M,
  EXTRUDE_MAX_M,
  STATUS_HEX,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/map3d/status";

interface MapLegendProps {
  extruded: boolean;
  /** lifts the legend above the timeline of the time mode */
  raised: boolean;
}

export default function MapLegend({ extruded, raised }: MapLegendProps) {
  return (
    <section
      aria-label="Gösterge"
      className={cn("absolute right-3 z-10 w-52 space-y-1.5 rounded-lg border border-border/60 bg-card/90 p-2.5 text-xs shadow backdrop-blur", raised ? "bottom-16" : "bottom-3")}
    >
      <ul className="space-y-1">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: STATUS_HEX[status] }}
              aria-hidden
            />
            {STATUS_LABEL[status]}
          </li>
        ))}
      </ul>
      {extruded && (
        <p className="border-t pt-1.5 text-[11px] text-muted-foreground">
          Parsel yüksekliği = sorun yoğunluğu: kritik bitki ×3, tedavide ×2, izlenen ×1, açık
          görev ×0,5 ({EXTRUDE_BASE_M}–{EXTRUDE_MAX_M} m).
        </p>
      )}
    </section>
  );
}
