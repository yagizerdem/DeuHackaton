import { useEffect, useMemo } from "react";
import {
  Cartesian2,
  Cartesian3,
  Color,
  CustomDataSource,
  HeightReference,
  LabelStyle,
  VerticalOrigin,
} from "cesium";
import type { ParcelDto } from "@DeparkHackaton/dto";
import { useGroundHeights } from "@components/map3d/use-ground-heights";
import { useViewer } from "@components/map3d/viewer-context";
import { centroidOf } from "@/lib/map3d/geometry";
import { ENTITY_ID } from "@/lib/map3d/selection";
import {
  extrudeHeightM,
  STATUS_HEX,
  type ParcelStats,
} from "@/lib/map3d/status";

export type ParcelStyle = "ground" | "extruded";

interface ParcelLayerProps {
  parcels: ParcelDto[];
  stats: ReadonlyMap<string, ParcelStats>;
  style: ParcelStyle;
  selectedId: string | null;
}

// a parcel without plants has no status to show
const NEUTRAL = Color.fromCssColorString("#64748b");

// Each parcel is a polygon draped over the terrain. Its color is the worst
// plant status inside it. As an extruded prism the height shows the problem
// density (critical plants and open tasks), so the troubled fields stand out.
export default function ParcelLayer({
  parcels,
  stats,
  style,
  selectedId,
}: ParcelLayerProps) {
  const viewer = useViewer();
  const centers = useMemo(() => parcels.map((p) => centroidOf(p.polygon)), [parcels]);
  const ground = useGroundHeights(centers);

  useEffect(() => {
    const source = new CustomDataSource("parcels");

    parcels.forEach((parcel, i) => {
      const parcelStats = stats.get(parcel.id);
      const base = parcelStats?.worst
        ? Color.fromCssColorString(STATUS_HEX[parcelStats.worst])
        : NEUTRAL;
      const selected = parcel.id === selectedId;
      const hierarchy = Cartesian3.fromDegreesArray(parcel.polygon.flat());

      const polygon =
        style === "extruded"
          ? {
              hierarchy,
              height: ground[i]!,
              extrudedHeight: ground[i]! + extrudeHeightM(parcelStats?.score ?? 0),
              material: base.withAlpha(selected ? 0.85 : 0.6),
              outline: true,
              outlineColor: selected ? Color.WHITE : base.darken(0.4, new Color()),
            }
          : {
              // no height: the polygon drapes over the terrain
              hierarchy,
              material: base.withAlpha(selected ? 0.7 : 0.4),
            };

      source.entities.add({
        id: ENTITY_ID.parcel + parcel.id,
        name: parcel.name,
        polygon,
        position: Cartesian3.fromDegrees(centers[i]!.lng, centers[i]!.lat),
        label: {
          text: parcel.name,
          font: "600 13px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -6),
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
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
  }, [viewer, parcels, stats, style, selectedId, centers, ground]);

  return null;
}
