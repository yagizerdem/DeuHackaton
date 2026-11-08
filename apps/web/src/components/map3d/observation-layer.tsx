import { useEffect, useMemo } from "react";
import { Cartesian3, Color, CustomDataSource } from "cesium";
import type { InvasiveObservationDto } from "@DeparkHackaton/dto";
import { useGroundHeights } from "@components/map3d/use-ground-heights";
import { useViewer } from "@components/map3d/viewer-context";
import { ENTITY_ID } from "@/lib/map3d/selection";
import { yearFraction, yearRgb, type YearRange } from "@/lib/year-color";

// the lowest points would sit on the ground without this lift
const BASE_HEIGHT_M = 40;

interface ObservationLayerProps {
  observations: InvasiveObservationDto[];
  yearRange: YearRange | null;
  /** height of the newest observations, in meters */
  maxHeightM: number;
}

// One 3D point per GBIF observation. Its height and color both show the year,
// a thin stem connects it to the ground so the position stays readable.
export default function ObservationLayer({
  observations,
  yearRange,
  maxHeightM,
}: ObservationLayerProps) {
  const viewer = useViewer();
  const points = useMemo(
    () => observations.map((o) => ({ lat: o.lat, lng: o.lng })),
    [observations],
  );
  const ground = useGroundHeights(points);

  useEffect(() => {
    if (!yearRange) return;

    const source = new CustomDataSource("invasive-observations");
    observations.forEach((o, i) => {
      const t = yearFraction(o.year, yearRange);
      const base = ground[i]!;
      const height = base + BASE_HEIGHT_M + t * maxHeightM;
      const [r, g, b] = yearRgb(t);
      const color = Color.fromBytes(r, g, b);

      source.entities.add({
        id: ENTITY_ID.observation + o.id,
        name: o.species,
        position: Cartesian3.fromDegrees(o.lng, o.lat, height),
        point: {
          pixelSize: 9,
          color,
          outlineColor: Color.BLACK.withAlpha(0.6),
          outlineWidth: 1,
        },
        polyline: {
          positions: Cartesian3.fromDegreesArrayHeights([
            o.lng,
            o.lat,
            base,
            o.lng,
            o.lat,
            height,
          ]),
          width: 1,
          material: color.withAlpha(0.45),
        },
      });
    });

    const added = viewer.dataSources.add(source);
    return () => {
      // the viewer may already be destroyed when the whole globe unmounts
      if (!viewer.isDestroyed()) {
        void added.then(() => viewer.dataSources.remove(source, true));
      }
    };
  }, [viewer, observations, yearRange, maxHeightM, ground]);

  return null;
}
