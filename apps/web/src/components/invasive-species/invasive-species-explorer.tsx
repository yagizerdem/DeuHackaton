import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import type { InvasiveObservationDto } from "@DeparkHackaton/dto";
import AnalysisDome from "@components/invasive-species/analysis-dome";
import CameraController from "@components/invasive-species/camera-controller";
import CesiumGlobe from "@components/invasive-species/cesium-globe";
import GlobePicker from "@components/invasive-species/globe-picker";
import LocationSelector from "@components/invasive-species/location-selector";
import ObservationDetail from "@components/invasive-species/observation-detail";
import ObservationLayer from "@components/invasive-species/observation-layer";
import RadiusSelect from "@components/invasive-species/radius-select";
import ThreatSummary from "@components/invasive-species/threat-summary";
import YearLegend from "@components/invasive-species/year-legend";
import { getApiErrorMessage } from "@/lib/api-error";
import { useInvasiveSpecies, type MapCenter } from "@/lib/invasive-species-api";

// Istanbul, until the user picks a parcel, a plant or a point on the globe
const DEFAULT_CENTER: MapCenter = { lat: 41.0082, lng: 28.9784 };
const DEFAULT_RADIUS_KM = 25;
// the newest observations reach this share of the radius in height
const HEIGHT_PER_RADIUS = 0.3;
const NO_OBSERVATIONS: InvasiveObservationDto[] = [];

export default function InvasiveSpeciesExplorer() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [pickOnGlobe, setPickOnGlobe] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useInvasiveSpecies(center, radiusKm);
  const data = query.data;
  // after a move the previous area's data stays around until the new one arrives
  const stale = query.isPlaceholderData;

  const maxHeightM = radiusKm * 1000 * HEIGHT_PER_RADIUS;
  const selected = data?.observations.find((o) => o.id === selectedId);

  const handlePick = useCallback((picked: MapCenter) => {
    setCenter(picked);
    setPickOnGlobe(false);
    setSelectedId(null);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <aside className="space-y-5 rounded-xl border border-border/50 bg-card p-4">
        <div>
          <h1 className="font-stitch-headline text-stitch-headline-sm text-foreground">
            Invasive species around you
          </h1>
          <p className="text-sm text-muted-foreground">
            GBIF observations of plant pests and invasive weeds, drawn in 3D.
          </p>
        </div>

        <LocationSelector
          center={center}
          onCenterChange={(next) => {
            setCenter(next);
            setSelectedId(null);
          }}
          pickOnGlobe={pickOnGlobe}
          onPickOnGlobeChange={setPickOnGlobe}
        />
        <RadiusSelect value={radiusKm} onChange={setRadiusKm} />
        <YearLegend yearRange={data?.yearRange ?? null} />

        <div aria-live="polite">
          {query.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(query.error, "Could not load observations.")}
            </p>
          ) : !data || stale ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading observations…
            </p>
          ) : (
            <ThreatSummary data={data} />
          )}
        </div>
      </aside>

      <div className="relative h-[70svh] overflow-hidden rounded-xl border border-border/50 lg:h-[calc(100svh-9rem)]">
        <CesiumGlobe>
          <CameraController center={center} radiusKm={radiusKm} />
          <AnalysisDome
            center={center}
            radiusKm={radiusKm}
            heightM={maxHeightM * 1.1}
          />
          <ObservationLayer
            observations={data && !stale ? data.observations : NO_OBSERVATIONS}
            yearRange={data?.yearRange ?? null}
            maxHeightM={maxHeightM}
            onSelect={setSelectedId}
          />
          <GlobePicker active={pickOnGlobe} onPick={handlePick} />
        </CesiumGlobe>

        {selected && (
          <div className="absolute bottom-3 left-3 w-72 max-w-[calc(100%-1.5rem)]">
            <ObservationDetail
              observation={selected}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
