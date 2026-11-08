import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { latLngBounds, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ParcelDto } from "@DeparkHackaton/dto";
import { cn } from "@/lib/utils";

type LngLat = [number, number];

// the API stores [lng, lat], leaflet wants [lat, lng]
const toLatLng = ([lng, lat]: LngLat): LatLngExpression => [lat, lng];

// Istanbul, used while there is nothing to fit
const DEFAULT_CENTER: LatLngExpression = [41.0082, 28.9784];

function FitBounds({ points }: { points: LngLat[] }) {
  const map = useMap();
  // the points array changes every render, a string key keeps the effect stable
  const key = JSON.stringify(points);

  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(latLngBounds(points.map(toLatLng)), {
      padding: [24, 24],
      maxZoom: 17,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

function ClickToDraw({ onPoint }: { onPoint: (point: LngLat) => void }) {
  useMapEvents({
    click(e) {
      onPoint([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

interface ParcelMapProps {
  parcels?: ParcelDto[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** corners being drawn, clicking the map appends one through onDraftPoint */
  draft?: LngLat[];
  onDraftPoint?: (point: LngLat) => void;
  /** zoom to these corners while drawing, e.g. the polygon being edited */
  focus?: LngLat[];
  className?: string;
}

export default function ParcelMap({
  parcels = [],
  selectedId,
  onSelect,
  draft,
  onDraftPoint,
  focus,
  className,
}: ParcelMapProps) {
  const fitPoints = parcels.flatMap((p) => p.polygon);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={6}
      // isolate keeps leaflet's high z-index panes below sticky headers and dialogs
      className={cn("isolate h-full min-h-72 w-full rounded-xl", className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={draft ? (focus ?? []) : fitPoints} />

      {parcels.map((parcel) => (
        <Polygon
          key={parcel.id}
          positions={parcel.polygon.map(toLatLng)}
          pathOptions={{
            color: parcel.kind === "garden" ? "#2a8c55" : "#c87d32",
            weight: parcel.id === selectedId ? 4 : 2,
            fillOpacity: parcel.id === selectedId ? 0.35 : 0.18,
          }}
          eventHandlers={{ click: () => onSelect?.(parcel.id) }}
        >
          <Tooltip sticky>{parcel.name}</Tooltip>
        </Polygon>
      ))}

      {draft && onDraftPoint && <ClickToDraw onPoint={onDraftPoint} />}
      {draft && draft.length >= 3 && (
        <Polygon
          positions={draft.map(toLatLng)}
          pathOptions={{ color: "#2a8c55", dashArray: "6" }}
        />
      )}
      {draft?.map((point, i) => (
        <CircleMarker
          key={`${point[0]},${point[1]},${i}`}
          center={toLatLng(point)}
          radius={5}
          pathOptions={{ color: "#2a8c55", fillOpacity: 1 }}
        />
      ))}
    </MapContainer>
  );
}
