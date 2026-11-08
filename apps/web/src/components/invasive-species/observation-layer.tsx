import { useEffect } from "react";
import { Cartesian3, Color, CustomDataSource } from "cesium";
import type { InvasiveObservationDto } from "@DeparkHackaton/dto";
import { useViewer } from "@components/invasive-species/viewer-context";
import { yearFraction, yearRgb, type YearRange } from "@/lib/year-color";

// the lowest points would sit on the ground without this lift
const BASE_HEIGHT_M = 40;
const ID_PREFIX = "obs-";

interface ObservationLayerProps {
  observations: InvasiveObservationDto[];
  yearRange: YearRange | null;
  /** height of the newest observations, in meters */
  maxHeightM: number;
  onSelect: (id: string | null) => void;
}

// One 3D point per GBIF observation. Its height and color both show the year,
// a thin stem connects it to the ground so the position stays readable.
export default function ObservationLayer({
  observations,
  yearRange,
  maxHeightM,
  onSelect,
}: ObservationLayerProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!yearRange) return;

    const source = new CustomDataSource("invasive-observations");
    for (const o of observations) {
      const t = yearFraction(o.year, yearRange);
      const height = BASE_HEIGHT_M + t * maxHeightM;
      const [r, g, b] = yearRgb(t);
      const color = Color.fromBytes(r, g, b);

      source.entities.add({
        id: ID_PREFIX + o.id,
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
            0,
            o.lng,
            o.lat,
            height,
          ]),
          width: 1,
          material: color.withAlpha(0.45),
        },
      });
    }

    const added = viewer.dataSources.add(source);
    const onSelectionChange = () => {
      const id = viewer.selectedEntity?.id;
      onSelect(typeof id === "string" && id.startsWith(ID_PREFIX)
        ? id.slice(ID_PREFIX.length)
        : null);
    };
    viewer.selectedEntityChanged.addEventListener(onSelectionChange);

    return () => {
      viewer.selectedEntityChanged.removeEventListener(onSelectionChange);
      // the viewer may already be destroyed when the whole globe unmounts
      if (!viewer.isDestroyed()) {
        void added.then(() => viewer.dataSources.remove(source, true));
      }
    };
  }, [viewer, observations, yearRange, maxHeightM, onSelect]);

  return null;
}
