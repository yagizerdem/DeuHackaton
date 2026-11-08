import { useEffect } from "react";
import { Cartesian3, Color, CustomDataSource } from "cesium";
import { useViewer } from "@components/map3d/viewer-context";
import type { LngLat } from "@/lib/map3d/geometry";

const AREA_COLOR = Color.fromCssColorString("#0ea5e9");

interface DrawnAreaProps {
  polygon: LngLat[] | null;
}

// The polygon the user finished drawing, draped over the terrain.
export default function DrawnArea({ polygon }: DrawnAreaProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!polygon) return;

    const source = new CustomDataSource("drawn-area");
    const positions = Cartesian3.fromDegreesArray(polygon.flat());
    source.entities.add({
      name: "Çizilen alan",
      // no height: the polygon drapes over the terrain
      polygon: { hierarchy: positions, material: AREA_COLOR.withAlpha(0.4) },
    });
    source.entities.add({
      polyline: {
        positions: [...positions, positions[0]!],
        width: 3,
        material: AREA_COLOR,
        clampToGround: true,
      },
    });

    const added = viewer.dataSources.add(source);
    return () => {
      if (!viewer.isDestroyed()) {
        void added.then(() => viewer.dataSources.remove(source, true));
      }
    };
  }, [viewer, polygon]);

  return null;
}
