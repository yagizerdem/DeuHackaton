import { ChartLineIcon, FlameIcon, XIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import BurntAreaLocator from "@components/risk/right-panel/burnt-area-locator";
import FireDangerChart from "@components/risk/right-panel/fire-danger-chart";
import { useRiskMap } from "@providers/risk-map-provider";
import { cn } from "@/lib/utils";

const PANELS = {
  chart: { title: "Fire danger chart", icon: ChartLineIcon },
  locator: { title: "Burnt area locator", icon: FlameIcon },
} as const;

/** Slides in from the right edge of the map; `null` keeps it closed. */
export default function RightPanel() {
  const { rightPanel: panel, setRightPanel } = useRiskMap();
  const active = panel ? PANELS[panel] : null;

  return (
    <>
      {!panel && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute right-3 top-16 z-[1000] shadow"
          onClick={() => setRightPanel("chart")}
        >
          <ChartLineIcon /> Fire danger chart
        </Button>
      )}

      <aside
        aria-hidden={!panel}
        inert={!panel}
        className={cn(
          "absolute bottom-3 right-3 top-16 z-[1000] flex w-80 max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-lg bg-background shadow-lg transition-transform duration-300",
          panel ? "translate-x-0" : "translate-x-[calc(100%+1rem)]",
        )}
      >
        <header className="flex items-center gap-2 bg-orange-400 px-3 py-2 text-white">
          {active && <active.icon className="size-4" />}
          <h2 className="flex-1 font-semibold">{active?.title}</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close panel"
            className="hover:bg-white/20"
            onClick={() => setRightPanel(null)}
          >
            <XIcon />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-3">
          {panel === "chart" && <FireDangerChart />}
          {panel === "locator" && <BurntAreaLocator />}
        </div>
      </aside>
    </>
  );
}
