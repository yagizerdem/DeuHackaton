import { useEffect } from "react";
import {
  BoundingSphere,
  Cartesian3,
  HeadingPitchRange,
  Math as CesiumMath,
} from "cesium";
import { useViewer } from "@components/map3d/viewer-context";

export interface FlyTarget {
  /** a new object flies again, even to the same place */
  lat: number;
  lng: number;
  /** distance from the target to the camera, in meters */
  rangeM: number;
  pitchDeg?: number;
}

interface CameraControllerProps {
  target: FlyTarget | null;
}

// Flies the camera to the target whenever it changes.
export default function CameraController({ target }: CameraControllerProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!target) return;
    viewer.camera.flyToBoundingSphere(
      new BoundingSphere(Cartesian3.fromDegrees(target.lng, target.lat), 0),
      {
        // range is the slant distance, a tilted view makes the heights readable
        offset: new HeadingPitchRange(
          0,
          CesiumMath.toRadians(target.pitchDeg ?? -35),
          target.rangeM,
        ),
        duration: 1.5,
      },
    );
    return () => {
      if (!viewer.isDestroyed()) viewer.camera.cancelFlight();
    };
  }, [viewer, target]);

  return null;
}
