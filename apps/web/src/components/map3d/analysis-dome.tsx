import { useEffect, useMemo } from "react";
import { Cartesian3, Color, CustomDataSource } from "cesium";
import { useGroundHeights } from "@components/map3d/use-ground-heights";
import { useViewer } from "@components/map3d/viewer-context";
import type { MapCenter } from "@/lib/invasive-species-api";

interface AnalysisDomeProps {
  center: MapCenter;
  radiusKm: number;
  /** height of the dome at its center, in meters */
  heightM: number;
}

const DOME_COLOR = Color.fromCssColorString("#2a8c55");
const RING_COLOR = Color.fromCssColorString("#c87d32");

// Translucent half sphere over the analysed area and a ring on the ground at its
// edge. Observations inside the dome are close enough to the farm to matter.
export default function AnalysisDome({
  center,
  radiusKm,
  heightM,
}: AnalysisDomeProps) {
  const viewer = useViewer();
  const centerPoint = useMemo(() => [center], [center]);
  const [ground = 0] = useGroundHeights(centerPoint);

  useEffect(() => {
    const radiusM = radiusKm * 1000;
    const position = Cartesian3.fromDegrees(center.lng, center.lat, ground);

    const source = new CustomDataSource("analysis-area");
    source.entities.add({
      name: "Analiz yarıçapı",
      position,
      ellipsoid: {
        radii: new Cartesian3(radiusM, radiusM, heightM),
        // cone angle is measured from the up axis, so 0..90° is the upper half
        minimumCone: 0,
        maximumCone: Math.PI / 2,
        material: DOME_COLOR.withAlpha(0.1),
        outline: true,
        outlineColor: DOME_COLOR.withAlpha(0.35),
        slicePartitions: 32,
        stackPartitions: 8,
      },
      ellipse: {
        semiMajorAxis: radiusM,
        semiMinorAxis: radiusM,
        material: DOME_COLOR.withAlpha(0.08),
        outline: true,
        outlineColor: RING_COLOR,
        outlineWidth: 2,
      },
    });
    source.entities.add({
      name: "Analiz merkezi",
      position,
      point: {
        pixelSize: 14,
        color: Color.WHITE,
        outlineColor: RING_COLOR,
        outlineWidth: 4,
      },
    });

    const added = viewer.dataSources.add(source);
    return () => {
      if (!viewer.isDestroyed()) {
        void added.then(() => viewer.dataSources.remove(source, true));
      }
    };
  }, [viewer, center, radiusKm, heightM, ground]);

  return null;
}
