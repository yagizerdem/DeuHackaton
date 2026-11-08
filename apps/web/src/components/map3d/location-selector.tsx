import { useMemo } from "react";
import { Crosshair, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { Field, FieldLabel } from "@components/ui/field";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import { useParcels, usePlants } from "@/lib/farm-api";
import type { MapCenter } from "@/lib/invasive-species-api";

interface Place extends MapCenter {
  id: string;
  label: string;
}

interface LocationSelectorProps {
  center: MapCenter;
  onCenterChange: (center: MapCenter) => void;
  pickOnGlobe: boolean;
  onPickOnGlobeChange: (active: boolean) => void;
}

const sameSpot = (a: MapCenter, b: MapCenter) =>
  Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

// The analysis can be centered on a saved parcel or plant, on the position of
// the visitor, or on any point picked on the globe.
export default function LocationSelector({
  center,
  onCenterChange,
  pickOnGlobe,
  onPickOnGlobeChange,
}: LocationSelectorProps) {
  const plants = usePlants();
  const parcels = useParcels();

  const places = useMemo<Place[]>(() => {
    const fromParcels = (parcels.data ?? []).map((parcel) => ({
      id: `parcel-${parcel.id}`,
      label: `Parsel: ${parcel.name}`,
      // the average of the corners is close enough to the middle of a field
      lat:
        parcel.polygon.reduce((sum, [, lat]) => sum + lat, 0) /
        parcel.polygon.length,
      lng:
        parcel.polygon.reduce((sum, [lng]) => sum + lng, 0) /
        parcel.polygon.length,
    }));
    const fromPlants = (plants.data ?? []).flatMap((plant) =>
      plant.location
        ? [
            {
              id: `plant-${plant.id}`,
              label: `Bitki: ${plant.name}`,
              ...plant.location,
            },
          ]
        : [],
    );
    return [...fromParcels, ...fromPlants];
  }, [parcels.data, plants.data]);

  const selected = places.find((place) => sameSpot(place, center));

  function moveToMyPosition() {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        onCenterChange({ lat: coords.latitude, lng: coords.longitude }),
      () => toast.error("Konumun okunamadı"),
    );
  }

  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel htmlFor="analysis-place">Konum</FieldLabel>
        <NativeSelect
          id="analysis-place"
          value={selected?.id ?? ""}
          onChange={(e) => {
            const place = places.find((p) => p.id === e.target.value);
            if (place) onCenterChange({ lat: place.lat, lng: place.lng });
          }}
        >
          <NativeSelectOption value="" disabled>
            {places.length === 0 ? "Kayıtlı yer yok" : "Özel nokta"}
          </NativeSelectOption>
          {places.map((place) => (
            <NativeSelectOption key={place.id} value={place.id}>
              {place.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <p className="font-stitch-label text-xs text-muted-foreground">
        {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={pickOnGlobe ? "default" : "outline"}
          size="sm"
          onClick={() => onPickOnGlobeChange(!pickOnGlobe)}
        >
          <Crosshair />
          {pickOnGlobe ? "Haritaya tıkla…" : "Haritadan seç"}
        </Button>
        <Button variant="outline" size="sm" onClick={moveToMyPosition}>
          <LocateFixed />
          Konumum
        </Button>
      </div>
    </div>
  );
}
