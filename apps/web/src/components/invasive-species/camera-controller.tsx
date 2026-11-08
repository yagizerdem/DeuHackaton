import { useEffect } from "react";
import {
  BoundingSphere,
  Cartesian3,
  HeadingPitchRange,
  Math as CesiumMath,
} from "cesium";
import { useViewer } from "@components/invasive-species/viewer-context";
import type { MapCenter } from "@/lib/invasive-species-api";

interface CameraControllerProps {
  center: MapCenter;
  radiusKm: number;
}

// Flies the camera to the analysed area whenever the center or the radius changes.
export default function CameraController({
  center,
  radiusKm,
}: CameraControllerProps) {
  const viewer = useViewer();

  useEffect(() => {
    const radiusM = radiusKm * 1000;
    viewer.camera.flyToBoundingSphere(
      new BoundingSphere(Cartesian3.fromDegrees(center.lng, center.lat), 0),
      {
        // range is the slant distance, a tilted view makes the heights readable
        offset: new HeadingPitchRange(0, CesiumMath.toRadians(-35), radiusM * 2.6),
        duration: 1.5,
      },
    );
    return () => viewer.camera.cancelFlight();
  }, [viewer, center, radiusKm]);

  return null;
}
