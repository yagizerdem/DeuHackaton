import { LayersControl, MapContainer, TileLayer, WMSTileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "@components/map/location-marker";
import {
  GWIS_ATTRIBUTION,
  GWIS_LAYER_GROUPS,
  GWIS_WMS_URL,
} from "@components/map/gwis-layers";
import { cn } from "@/lib/utils";

interface LeafletMap2DProps {
  center?: LatLngExpression;
  zoom?: number;
  // YYYY-MM-DD, sent as the WMS TIME parameter to time-enabled layers.
  // Omitted: the server uses each layer's default date.
  date?: string;
  className?: string;
}

// Istanbul
const DEFAULT_CENTER: LatLngExpression = [41.0082, 28.9784];

export default function LeafletMap2D({
  center = DEFAULT_CENTER,
  zoom = 6,
  date,
  className,
}: LeafletMap2DProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      // isolate keeps leaflet's high z-index panes below sticky headers and dialogs
      className={cn("isolate h-full w-full", className)}
      bounceAtZoomLimits
      doubleClickZoom={false}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        {GWIS_LAYER_GROUPS.flatMap((group) =>
          group.layers.map((layer) => (
            <LayersControl.Overlay
              key={layer.name}
              checked={layer.checked}
              name={`${group.label}: ${layer.label}`}
            >
              <WMSTileLayer
                url={GWIS_WMS_URL}
                layers={layer.name}
                format="image/png"
                transparent
                version="1.3.0"
                opacity={layer.opacity ?? 1}
                attribution={GWIS_ATTRIBUTION}
                // leaflet forwards unknown options to the request as WMS parameters
                {...(layer.timeEnabled && date ? { time: date } : {})}
              />
            </LayersControl.Overlay>
          )),
        )}
      </LayersControl>
      <LocationMarker />
    </MapContainer>
  );
}
