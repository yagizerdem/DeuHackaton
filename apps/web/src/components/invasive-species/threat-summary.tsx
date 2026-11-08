import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { InvasiveSpeciesMapDto } from "@DeparkHackaton/dto";
import { cn } from "@/lib/utils";

// how close a threat has to be before it counts as an immediate danger
const CLOSE_KM = 1;
const NEAR_KM = 5;

function proximity(km: number) {
  if (km <= CLOSE_KM) return { label: "Very close", style: "text-destructive" };
  if (km <= NEAR_KM) {
    return { label: "Nearby", style: "text-stitch-on-tertiary-container" };
  }
  return { label: "Further away", style: "text-muted-foreground" };
}

interface ThreatSummaryProps {
  data: InvasiveSpeciesMapDto;
}

export default function ThreatSummary({ data }: ThreatSummaryProps) {
  if (!data.nearest) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card p-3 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-stitch-secondary" />
        <p className="text-muted-foreground">
          No tracked invasive species were observed within {data.radiusKm} km.
        </p>
      </div>
    );
  }

  const { label, style } = proximity(data.nearest.distanceKm);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card p-3 text-sm">
        <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", style)} />
        <div>
          <p className={cn("font-semibold", style)}>
            {label}: {data.nearest.distanceKm} km
          </p>
          <p className="text-muted-foreground">
            The closest threat is <em>{data.nearest.species}</em>.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
          {data.observations.length} observations
        </p>
        <ul className="space-y-1 text-sm">
          {data.species.map((s) => (
            <li key={s.species} className="flex justify-between gap-2">
              <em className="truncate text-foreground">{s.species}</em>
              <span className="shrink-0 font-stitch-label text-xs text-muted-foreground">
                {s.count} · {s.nearestKm} km
              </span>
            </li>
          ))}
        </ul>
      </div>

      {data.truncated && (
        <p className="text-xs text-muted-foreground">
          There are more observations than shown. Use a smaller radius for the
          full picture.
        </p>
      )}
    </div>
  );
}
