import { useCallback, useMemo, useState } from "react";
import { Loader2, PenTool, X } from "lucide-react";
import type {
  AnalysisRecordDto,
  BoardTaskDto,
  InvasiveObservationDto,
  ParcelDto,
  PlantOverviewDto,
} from "@DeparkHackaton/dto";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import AnalysisDome from "@components/map3d/analysis-dome";
import BuildingsLayer from "@components/map3d/buildings-layer";
import CameraController, { type FlyTarget } from "@components/map3d/camera-controller";
import CesiumGlobe, { HAS_ION_TOKEN } from "@components/map3d/cesium-globe";
import DrawResultPanel from "@components/map3d/draw-result-panel";
import DrawTool from "@components/map3d/draw-tool";
import DrawnArea from "@components/map3d/drawn-area";
import FireSummary from "@components/map3d/fire-summary";
import GlobePicker from "@components/map3d/globe-picker";
import ImageryOverlays from "@components/map3d/imagery-overlays";
import InfoPanel from "@components/map3d/info-panel";
import LayerControls from "@components/map3d/layer-controls";
import LocationSelector from "@components/map3d/location-selector";
import MapLegend from "@components/map3d/map-legend";
import ObservationLayer from "@components/map3d/observation-layer";
import ParcelLayer from "@components/map3d/parcel-layer";
import PlantLayer from "@components/map3d/plant-layer";
import RadiusSelect from "@components/map3d/radius-select";
import SelectionBridge from "@components/map3d/selection-bridge";
import ThreatSummary from "@components/map3d/threat-summary";
import TimeController from "@components/map3d/time-controller";
import TourControls from "@components/map3d/tour-controls";
import TourLayer from "@components/map3d/tour-layer";
import YearLegend from "@components/map3d/year-legend";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useAnalysisRecords,
  useParcels,
} from "@/lib/farm-api";
import { useBoard, usePlantOverview } from "@/lib/farm-overview-api";
import { useInvasiveSpecies, type MapCenter } from "@/lib/invasive-species-api";
import { centroidOf, distanceKm, type LngLat } from "@/lib/map3d/geometry";
import { DEFAULT_LAYERS, type LayerState } from "@/lib/map3d/layers";
import type { MapSelection } from "@/lib/map3d/selection";
import { parcelStats } from "@/lib/map3d/status";
import { dueToday, orderStops, tourStops } from "@/lib/map3d/tour";

// Istanbul, until the user has a parcel or a plant to look at
const DEFAULT_CENTER: MapCenter = { lat: 41.0082, lng: 28.9784 };
const DEFAULT_RADIUS_KM = 10;
const DEFAULT_RANGE_M = 40_000;
const MIN_FARM_RANGE_M = 700;
// the newest observations reach this share of the radius in height
const HEIGHT_PER_RADIUS = 0.3;

const NO_PARCELS: ParcelDto[] = [];
const NO_PLANTS: PlantOverviewDto[] = [];
const NO_TASKS: BoardTaskDto[] = [];
const NO_RECORDS: AnalysisRecordDto[] = [];
const NO_OBSERVATIONS: InvasiveObservationDto[] = [];

type Mode = "idle" | "pick" | "draw";

function focusOnFarm(farmKey: string): FlyTarget {
  if (!farmKey) return { ...DEFAULT_CENTER, rangeM: DEFAULT_RANGE_M, pitchDeg: -45 };
  const [lat, lng, reach] = farmKey.split(",").map(Number) as [number, number, number];
  return { lat, lng, rangeM: Math.max(MIN_FARM_RANGE_M, reach * 3), pitchDeg: -40 };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

export default function Map3DExplorer() {
  const parcels = useParcels().data ?? NO_PARCELS;
  const plants = usePlantOverview().data ?? NO_PLANTS;
  const tasks = useBoard().data ?? NO_TASKS;
  const records = useAnalysisRecords().data ?? NO_RECORDS;

  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [mode, setMode] = useState<Mode>("idle");
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [drawn, setDrawn] = useState<LngLat[] | null>(null);
  const [userCenter, setUserCenter] = useState<MapCenter | null>(null);
  const [userFocus, setUserFocus] = useState<FlyTarget | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [tourRunning, setTourRunning] = useState(false);
  const [tourActive, setTourActive] = useState<number | null>(null);

  const patchLayers = useCallback(
    (patch: Partial<LayerState>) => setLayers((current) => ({ ...current, ...patch })),
    [],
  );

  // ---- the farm: every parcel and plant that has a position
  const farm = useMemo(() => {
    const points = [
      ...parcels.map((p) => centroidOf(p.polygon)),
      ...plants.flatMap((p) => (p.location ? [p.location] : [])),
    ];
    if (points.length === 0) return null;
    const center = {
      lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
      lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
    };
    const reach = Math.max(...points.map((p) => distanceKm(center, p))) * 1000;
    return { center, reach };
  }, [parcels, plants]);
  // A primitive key: refetching the lists must not make the camera fly again.
  const farmKey = farm
    ? `${farm.center.lat.toFixed(5)},${farm.center.lng.toFixed(5)},${Math.round(farm.reach)}`
    : "";
  const defaultFocus = useMemo(() => focusOnFarm(farmKey), [farmKey]);

  const center = userCenter ?? farm?.center ?? DEFAULT_CENTER;
  const target = userFocus ?? defaultFocus;

  // ---- derived farm data
  const stats = useMemo(() => parcelStats(plants), [plants]);
  const stops = useMemo(
    () => orderStops(tourStops(dueToday(tasks), plants), farm?.center),
    [tasks, plants, farm],
  );

  // ---- GBIF threats around the analysed point
  const threats = useInvasiveSpecies(center, radiusKm, layers.threats);
  const threatData = threats.data;
  const stale = threats.isPlaceholderData;
  const observations =
    layers.threats && threatData && !stale ? threatData.observations : NO_OBSERVATIONS;
  const maxHeightM = radiusKm * 1000 * HEIGHT_PER_RADIUS;

  // ---- actions
  const focusOnCenter = useCallback(
    (next: MapCenter, km: number) =>
      setUserFocus({ ...next, rangeM: km * 1000 * 2.6, pitchDeg: -35 }),
    [],
  );

  const handleCenterChange = useCallback(
    (next: MapCenter) => {
      setUserCenter(next);
      setSelection(null);
      focusOnCenter(next, radiusKm);
    },
    [focusOnCenter, radiusKm],
  );

  const handleRadiusChange = useCallback(
    (km: number) => {
      setRadiusKm(km);
      focusOnCenter(center, km);
    },
    [center, focusOnCenter],
  );

  const handlePick = useCallback(
    (picked: MapCenter) => {
      setMode("idle");
      handleCenterChange(picked);
    },
    [handleCenterChange],
  );

  const handleSelect = useCallback(
    (next: MapSelection | null) => {
      setSelection(next);
      if (next?.kind === "parcel") {
        const parcel = parcels.find((p) => p.id === next.id);
        if (!parcel) return;
        const middle = centroidOf(parcel.polygon);
        const reach = Math.max(
          ...parcel.polygon.map(([lng, lat]) => distanceKm(middle, { lat, lng })),
        );
        setUserFocus({ ...middle, rangeM: Math.max(350, reach * 1000 * 3.2), pitchDeg: -40 });
      }
      if (next?.kind === "plant") {
        const plant = plants.find((p) => p.id === next.id);
        if (plant?.location) setUserFocus({ ...plant.location, rangeM: 220, pitchDeg: -40 });
      }
    },
    [parcels, plants],
  );

  const handleDrawn = useCallback((polygon: LngLat[]) => {
    setDrawn(polygon);
    setSelection(null);
    setMode("idle");
  }, []);

  const startTour = () => {
    setSelection(null);
    patchLayers({ tourRoute: true });
    setTourRunning(true);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[21rem_1fr]">
      <aside className="space-y-5 rounded-xl border border-border/50 bg-card p-4 lg:max-h-[calc(100svh-9rem)] lg:overflow-y-auto">
        <div>
          <h1 className="font-stitch-headline text-stitch-headline-sm text-foreground">
            3B Harita
          </h1>
          <p className="text-sm text-muted-foreground">
            Çiftliğin, tehditlerin ve araziyle ilgili tüm veriler tek haritada.
          </p>
          {!farm && (
            <p className="mt-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
              Henüz parsel veya konumlu bitkin yok. Aşağıdan haritaya alan çizerek başlayabilirsin.
            </p>
          )}
        </div>

        <section className="space-y-2">
          <SectionTitle>Katmanlar</SectionTitle>
          <LayerControls layers={layers} onChange={patchLayers} hasIon={HAS_ION_TOKEN} />
        </section>

        <section className="space-y-3">
          <SectionTitle>Analiz bölgesi</SectionTitle>
          <LocationSelector
            center={center}
            onCenterChange={handleCenterChange}
            pickOnGlobe={mode === "pick"}
            onPickOnGlobeChange={(active) => setMode(active ? "pick" : "idle")}
          />
          <RadiusSelect value={radiusKm} onChange={handleRadiusChange} />
          {layers.burntAreas && <FireSummary center={center} radiusKm={radiusKm} />}
          {layers.threats && (
            <>
              <YearLegend yearRange={threatData?.yearRange ?? null} />
              <div aria-live="polite">
                {threats.isError ? (
                  <p className="text-sm text-destructive">
                    {getApiErrorMessage(threats.error, "Gözlemler yüklenemedi.")}
                  </p>
                ) : !threatData || stale ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Gözlemler yükleniyor…
                  </p>
                ) : (
                  <ThreatSummary data={threatData} />
                )}
              </div>
            </>
          )}
        </section>

        <section className="space-y-2">
          <SectionTitle>Zaman çizelgesi</SectionTitle>
          <div className="flex items-start gap-2">
            <Checkbox
              id="time-mode"
              checked={layers.timeMode}
              disabled={records.length === 0}
              onCheckedChange={(timeMode) => patchLayers({ timeMode })}
              className="mt-0.5"
            />
            <label htmlFor="time-mode" className="text-sm leading-tight">
              Hastalık geçmişini oynat
              <span className="block text-xs text-muted-foreground">
                {records.length === 0
                  ? "Analiz kaydı olunca açılır."
                  : "Bitki renkleri analiz kayıtlarının tarihine göre değişir. Haritanın altındaki oynat düğmesini kullan."}
              </span>
            </label>
          </div>
        </section>

        <section className="space-y-2">
          <SectionTitle>Saha turu</SectionTitle>
          <TourControls
            stops={stops}
            showRoute={layers.tourRoute}
            running={tourRunning}
            activeIndex={tourActive}
            onShowRouteChange={(tourRoute) => patchLayers({ tourRoute })}
            onStart={startTour}
            onStop={() => setTourRunning(false)}
          />
        </section>

        <section className="space-y-2">
          <SectionTitle>Alan çiz</SectionTitle>
          {mode === "draw" ? (
            <>
              <p className="text-xs text-muted-foreground">
                Köşeleri tıkla. Son köşeye çift tıkla ya da sağ tıkla bitir (sağ tık köşe eklemez).
                Backspace son köşeyi siler, Esc iptal eder.
              </p>
              <Button variant="outline" size="sm" onClick={() => setMode("idle")}>
                <X />
                Çizimi iptal et
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDrawn(null);
                setSelection(null);
                setMode("draw");
              }}
            >
              <PenTool />
              Yeni parsel çiz
            </Button>
          )}
        </section>
      </aside>

      <div className="relative h-[70svh] overflow-hidden rounded-xl border border-border/50 lg:h-[calc(100svh-9rem)]">
        <CesiumGlobe>
          <CameraController target={target} />
          <TimeController enabled={layers.timeMode} records={records} />
          <ImageryOverlays
            burntAreas={layers.burntAreas}
            fireWeather={layers.fireWeather}
            landCover={layers.landCover}
            opacity={layers.overlayOpacity}
          />
          <BuildingsLayer source={HAS_ION_TOKEN ? layers.buildings : null} />

          {layers.parcels && (
            <ParcelLayer
              parcels={parcels}
              stats={stats}
              style={layers.parcelStyle}
              selectedId={selection?.kind === "parcel" ? selection.id : null}
            />
          )}
          {layers.plants && (
            <PlantLayer
              plants={plants}
              records={records}
              showPoles={layers.poles}
              selectedId={selection?.kind === "plant" ? selection.id : null}
            />
          )}
          {layers.threats && (
            <>
              <AnalysisDome center={center} radiusKm={radiusKm} heightM={maxHeightM * 1.1} />
              <ObservationLayer
                observations={observations}
                yearRange={threatData?.yearRange ?? null}
                maxHeightM={maxHeightM}
              />
            </>
          )}

          <TourLayer
            stops={stops}
            show={layers.tourRoute}
            running={tourRunning}
            onActive={setTourActive}
            onFinished={() => setTourRunning(false)}
          />
          <DrawnArea polygon={drawn} />
          <DrawTool
            active={mode === "draw"}
            onFinish={handleDrawn}
            onCancel={() => setMode("idle")}
          />
          <GlobePicker active={mode === "pick"} onPick={handlePick} />
          <SelectionBridge enabled={mode === "idle"} onSelect={handleSelect} />

          <InfoPanel
            selection={selection}
            parcels={parcels}
            plants={plants}
            tasks={tasks}
            records={records}
            stats={stats}
            observations={observations}
            onClose={() => setSelection(null)}
          />
          {drawn && (
            <DrawResultPanel
              polygon={drawn}
              onClear={() => setDrawn(null)}
              onSaved={() => setDrawn(null)}
            />
          )}
        </CesiumGlobe>

        <MapLegend extruded={layers.parcels && layers.parcelStyle === "extruded"} raised={layers.timeMode} />
      </div>
    </div>
  );
}
