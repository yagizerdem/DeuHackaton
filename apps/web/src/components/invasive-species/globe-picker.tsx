import { useEffect } from "react";
import {
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium";
import { useViewer } from "@components/invasive-species/viewer-context";
import type { MapCenter } from "@/lib/invasive-species-api";

interface GlobePickerProps {
  active: boolean;
  onPick: (center: MapCenter) => void;
}

// While active, a click on the globe picks the new center of the analysis.
export default function GlobePicker({ active, onPick }: GlobePickerProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!active) return;

    const canvas = viewer.scene.canvas;
    const previousCursor = canvas.style.getPropertyValue("cursor");
    canvas.style.setProperty("cursor", "crosshair");

    const handler = new ScreenSpaceEventHandler(canvas);
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = viewer.camera.pickEllipsoid(
        event.position,
        viewer.scene.globe.ellipsoid,
      );
      if (!cartesian) return;
      const { latitude, longitude } =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      onPick({
        lat: CesiumMath.toDegrees(latitude),
        lng: CesiumMath.toDegrees(longitude),
      });
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      canvas.style.setProperty("cursor", previousCursor);
    };
  }, [viewer, active, onPick]);

  return null;
}
