import DefaultLayout from "@/layouts/default-layout";
import LeafletMap2D from "@components/map/leaflet-map-2d";

export default function MapPage() {
  return (
    <DefaultLayout>
      <div className="h-svh w-full">
        <LeafletMap2D />
      </div>
    </DefaultLayout>
  );
}
