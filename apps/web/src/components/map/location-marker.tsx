import { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon, type LatLng } from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// leaflet resolves its default icon paths at runtime, which breaks once bundled
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LocationMarker() {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    dblclick(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}>
      <Popup>
        <span className="font-stitch-label text-stitch-label-sm">
          {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </span>
      </Popup>
    </Marker>
  );
}
