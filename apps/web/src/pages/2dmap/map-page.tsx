import AppLayout from "@/layouts/app-layout";
import LeafletMap2D from "@components/map/leaflet-map-2d";

export default function MapPage() {
  return (
    <AppLayout>
      <div className="h-svh w-full">
        <LeafletMap2D />
      </div>
    </AppLayout>
  );
}
