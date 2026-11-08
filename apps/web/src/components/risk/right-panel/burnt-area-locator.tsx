import { useEffect, useState } from "react";
import { RefreshCwIcon, ZoomInIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import { useEventEmitter } from "@hooks/use-event-emitter";
import type { ZoomRiskMapEvent } from "@components/risk/type";
import {
  addDays,
  fetchBurntAreas,
  getDamageRange,
  type BurntArea,
} from "@lib/gwis";
import { today } from "@lib/utils";
import { useRiskMap } from "@providers/risk-map-provider";

// `key` identifies the request a result belongs to; a mismatch means loading
type Result = { key: string } & (
  { status: "done"; areas: BurntArea[] } | { status: "error"; message: string }
);

const LEGEND = [
  { label: "Last 7 dd.", color: "#ef4444" },
  { label: "Last 30 dd.", color: "#f59e0b" },
  { label: "Older", color: "#06b6d4" },
];

function ageColor(startDate: string) {
  const day = startDate.slice(0, 10);
  if (day >= addDays(today(), -7)) return LEGEND[0].color;
  if (day >= addDays(today(), -30)) return LEGEND[1].color;
  return LEGEND[2].color;
}

export default function BurntAreaLocator() {
  const { damageOptions: options, getMapBounds } = useRiskMap();
  // read at search time so panning the map does not trigger a new query
  const { publishEvent } = useEventEmitter<ZoomRiskMapEvent>("zoom-risk-map");

  const [from, to] = getDamageRange(options);
  const [result, setResult] = useState<Result>();
  const [reloadKey, setReloadKey] = useState(0);
  const key = `${from}|${to}|${reloadKey}`;

  useEffect(() => {
    const view = getMapBounds();
    if (!view) return;
    const controller = new AbortController();
    fetchBurntAreas(view, from, to, controller.signal)
      .then((areas) =>
        setResult({
          key,
          status: "done",
          areas: areas.sort((a, b) => b.startDate.localeCompare(a.startDate)),
        }),
      )
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({
          key,
          status: "error",
          message: String(err.message ?? err),
        });
      });
    return () => controller.abort();
  }, [from, to, key, getMapBounds]);

  const state = result?.key === key ? result : undefined;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="text-center">
        <b>From</b> {from} <b>To</b> {to}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs">Legend</span>
        {LEGEND.map(({ label, color }) => (
          <span
            key={label}
            className="rounded-md border-2 px-2 py-0.5 text-xs font-semibold"
            style={{ borderColor: color, color }}
          >
            {label}
          </span>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setReloadKey((key) => key + 1)}
      >
        <RefreshCwIcon /> Search current map view
      </Button>

      {!state && <p className="text-muted-foreground">Loading…</p>}
      {state?.status === "error" && (
        <p className="text-destructive">Error: {state.message}</p>
      )}
      {state?.status === "done" && state.areas.length === 0 && (
        <p className="text-muted-foreground">
          No burnt areas in the current view for this period.
        </p>
      )}
      {state?.status === "done" &&
        state.areas.map((area) => (
          <div
            key={area.id}
            className="flex items-center justify-between rounded-lg border-2 bg-muted/40 px-3 py-2"
            style={{ borderColor: ageColor(area.startDate) }}
          >
            <div>
              <div className="font-medium">
                {area.startDate.slice(0, 10)} / {area.areaHa}ha
              </div>
              <div className="text-xs text-muted-foreground">ID {area.id}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom to burnt area"
              onClick={() => publishEvent({ bounds: area.bounds })}
            >
              <ZoomInIcon />
            </Button>
          </div>
        ))}
    </div>
  );
}
