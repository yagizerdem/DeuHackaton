import { useEffect } from "react";
import {
  BoundingSphere,
  Entity,
  HeadingPitchRange,
  JulianDate,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium";
import { useViewer } from "@components/map3d/viewer-context";
import { selectionFromEntityId, type MapSelection } from "@/lib/map3d/selection";

// pins this close are one spot, zoom no further than the plants themselves
const MIN_CLUSTER_VIEW_M = 90;

interface SelectionBridgeProps {
  /** off while another tool owns the clicks */
  enabled: boolean;
  onSelect: (selection: MapSelection | null) => void;
}

// A click picks what is under the cursor: a parcel, a plant pin or pole, an
// observation. A click on a cluster zooms in to the pins inside it.
export default function SelectionBridge({ enabled, onSelect }: SelectionBridgeProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!enabled) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(event.position) as { id?: unknown } | undefined;

      if (Array.isArray(picked?.id)) {
        const positions = (picked.id as Entity[]).flatMap((entity) => {
          const position = entity.position?.getValue(JulianDate.now());
          return position ? [position] : [];
        });
        if (positions.length === 0) return;
        const sphere = BoundingSphere.fromPoints(positions);
        sphere.radius = Math.max(sphere.radius, MIN_CLUSTER_VIEW_M);
        viewer.camera.flyToBoundingSphere(sphere, {
          offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45), sphere.radius * 3),
          duration: 1.2,
        });
        return;
      }

      const id = picked?.id instanceof Entity ? picked.id.id : undefined;
      onSelect(selectionFromEntityId(id));
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => handler.destroy();
  }, [viewer, enabled, onSelect]);

  return null;
}

