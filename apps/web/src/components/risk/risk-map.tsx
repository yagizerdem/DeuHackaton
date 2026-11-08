import { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMapEvents,
  WMSTileLayer,
} from "react-leaflet";
import { latLngBounds, type LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import RiskSummary from "@components/risk/risk-summary";
import {
  fetchFireRisk,
  LEVEL_STYLE,
  type FireRiskAssessment,
} from "@lib/risk-api";
import { useEventEmitter } from "@hooks/use-event-emitter";
import type {
  ResizeRiskMapEvent,
  ZoomRiskMapEvent,
} from "@components/risk/type";
import { GWIS_WMS, getDamageLayerSpecs } from "@lib/gwis";
import {
  type ForecastOptions,
  type TFireForcastDangerSource,
  useRiskMap,
} from "@providers/risk-map-provider";

type Probe =
  | { status: "loading"; position: LatLng }
  | { status: "done"; position: LatLng; risk: FireRiskAssessment }
  | { status: "error"; position: LatLng; message: string };

const IZMIR: [number, number] = [38.42, 27.14];

function ClickToAssess({
  date,
  onProbe,
}: {
  date?: string;
  onProbe: (probe: Probe) => void;
}) {
  const pending = useRef<AbortController | null>(null);
  const { setChartPoint } = useRiskMap();

  useMapEvents({
    async click(e) {
      setChartPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      pending.current?.abort();
      const controller = new AbortController();
      pending.current = controller;

      const position = e.latlng;
      onProbe({ status: "loading", position });
      try {
        const risk = await fetchFireRisk(
          position.lat,
          position.lng,
          date,
          controller.signal,
        );
        onProbe({ status: "done", position, risk });
      } catch (err) {
        if (controller.signal.aborted) return;
        onProbe({ status: "error", position, message: String(err) });
      }
    },
  });

  return null;
}

/** Mirrors the visible map bounds into the store and zooms on request. */
function MapViewSync() {
  const { setMapBounds } = useRiskMap();
  const { eventData } = useEventEmitter<ZoomRiskMapEvent>("zoom-risk-map");

  const map = useMapEvents({
    moveend: () => publishBounds(),
  });

  function publishBounds() {
    const b = map.getBounds();
    setMapBounds([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
  }

  useEffect(publishBounds, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!eventData) return;
    const [south, west, north, east] = eventData.bounds;
    map.fitBounds(latLngBounds([south, west], [north, east]), {
      maxZoom: 13,
      padding: [40, 40],
    });
  }, [eventData, map]);

  return null;
}

// GWIS layer name is `<source>.<suffix>`, e.g. ecmwf.fwi, ecmwf.mark5.kbdi.
// `sources` lists where the layer exists in GWIS; omitted means all sources.
const FORECAST_LAYERS: Record<
  ForecastOptions["fireWeatherIndex"]["full_name"],
  { suffix: string; sources?: TFireForcastDangerSource[] }
> = {
  FIRE_WEATHER_INDEX: { suffix: "fwi" },
  INITIAL_SPREAD_INDEX: { suffix: "isi" },
  BUILD_UP_INDEX: { suffix: "bui" },
  FINE_FUEL_MOISTURE_CODE: { suffix: "ffmc" },
  DUFF_MOISTURE_CODE: { suffix: "dmc" },
  DROUGHT_CODE: { suffix: "dc" },
  ANOMALY: { suffix: "anomaly", sources: ["ecmwf", "mf025"] },
  RANKING: { suffix: "ranking", sources: ["ecmwf", "mf025"] },
  KEETCH_BYRAM_DROUGHT_INDEX: { suffix: "mark5.kbdi", sources: ["ecmwf"] },
  DROUGHT_FACTOR: { suffix: "mark5.df", sources: ["ecmwf"] },
  RATE_OF_SPREAD: { suffix: "mark5.ros", sources: ["ecmwf"] },
  FIRE_DANGER_INDEX: { suffix: "mark5.fdi", sources: ["ecmwf"] },
  NFDRS_RATE_OF_SPREAD: { suffix: "nfdrs.ros", sources: ["ecmwf"] },
  NFDRS_SPREAD_COMPONENT: { suffix: "nfdrs.sc", sources: ["ecmwf"] },
  NFDRS_ENERGY_RELEASE_COMPONENT: { suffix: "nfdrs.erc", sources: ["ecmwf"] },
  NFDRS_BURNING_INDEX: { suffix: "nfdrs.bi", sources: ["ecmwf"] },
  NFDRS_IGNITION_PROBABILITY: { suffix: "nfdrs.ic", sources: ["ecmwf"] },
};

function getFireDangerLayer({
  fireDangerSource,
  fireWeatherIndex,
}: ForecastOptions) {
  const { suffix, sources } = FORECAST_LAYERS[fireWeatherIndex.full_name];
  if (sources && !sources.includes(fireDangerSource)) return null;
  return `${fireDangerSource}.${suffix}`;
}

export default function RiskMap() {
  const [probe, setProbe] = useState<Probe | null>(null);
  const level = probe?.status === "done" ? probe.risk.structural.level : null;
  const color = level ? LEVEL_STYLE[level].color : "#64748b";

  const { eventData } = useEventEmitter<ResizeRiskMapEvent>("resize-risk-map");
  const mapRef = useRef<ComponentRef<typeof MapContainer>>(null);
  const {
    mapOptions,
    forecastOptions,
    damageOptions,
    selectedDate: date,
  } = useRiskMap();
  const fireDangerLayer = getFireDangerLayer(forecastOptions);
  const lightningEnabled = forecastOptions.showLightningForecast;

  useEffect(() => {
    if (eventData?.resizeLeafletMap && mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [eventData]);

  const damageLayers = getDamageLayerSpecs(damageOptions, date);

  return (
    <MapContainer
      center={IZMIR}
      zoom={10}
      className="h-full w-full"
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <ClickToAssess date={date} onProbe={setProbe} />
      <MapViewSync />
      {probe && (
        <CircleMarker
          // re-mount so the popup opens again for every new click
          key={`${probe.position.lat},${probe.position.lng},${probe.status}`}
          center={probe.position}
          radius={10}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
          eventHandlers={{ add: (e) => e.target.openPopup() }}
        >
          <Popup minWidth={240}>
            {probe.status === "loading" && "Risk hesaplanıyor…"}
            {probe.status === "error" && `Hata: ${probe.message}`}
            {probe.status === "done" && <RiskSummary risk={probe.risk} />}
          </Popup>
        </CircleMarker>
      )}

      {mapOptions.countryBoundariesLayer && (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Esri"
        />
      )}

      {/* map layers */}

      {/* Human Settlement */}
      {mapOptions.humanSettlementLayer && (
        <WMSTileLayer
          url={GWIS_WMS}
          layers="ghsl"
          format="image/png"
          transparent
          opacity={0.7}
          attribution="GWIS"
        />
      )}

      {/* Fuels */}

      {mapOptions.fuelsLayer && (
        <WMSTileLayer
          url={GWIS_WMS}
          layers="fuel_map"
          format="image/png"
          transparent
          opacity={0.7}
        />
      )}

      {/* Protected Areas */}
      {mapOptions.protectedAreasLayer && (
        <WMSTileLayer
          url={GWIS_WMS}
          layers="wdpa.poly"
          format="image/png"
          transparent
          opacity={0.7}
        />
      )}

      {/* Modis Landcover */}
      {mapOptions.modisLandcoverLayer && (
        <WMSTileLayer
          url={GWIS_WMS}
          layers="landcover.mcd12.orig.2024"
          format="image/png"
          transparent
          opacity={0.7}
          version="1.1.1"
        />
      )}

      {/* CORINE Land Cover 2018 */}
      {mapOptions.corineLandcoverLayer && (
        <WMSTileLayer
          url="https://image.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer"
          layers="12"
          format="image/png"
          transparent
          opacity={0.7}
          version="1.1.1"
          attribution="Copernicus Land Monitoring Service / EEA"
        />
      )}

      {/* Fire danger forecast */}
      {forecastOptions.showFireDangerForecast && fireDangerLayer && (
        <WMSTileLayer
          key={fireDangerLayer}
          url={GWIS_WMS}
          format="image/png"
          transparent
          opacity={0.7}
          params={{
            time: date,
            layers: fireDangerLayer,
          }}
          attribution="GWIS"
        />
      )}

      {lightningEnabled && (
        <WMSTileLayer
          key={"ecmwf.extra.lightning"}
          url={GWIS_WMS}
          format="image/png"
          transparent
          opacity={0.7}
          params={{
            time: date,
            layers: "ecmwf.extra.lightning",
          }}
          attribution="GWIS"
        />
      )}

      {/* Rapid damage assessment: active fires and burnt areas */}
      {damageLayers.map(({ layers, time }) => (
        <WMSTileLayer
          key={`${layers}|${time ?? ""}`}
          url={GWIS_WMS}
          format="image/png"
          transparent
          params={{ layers, ...(time && { time }) }}
          attribution="GWIS"
        />
      ))}
    </MapContainer>
  );
}
