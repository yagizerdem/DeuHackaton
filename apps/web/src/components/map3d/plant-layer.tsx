import { useEffect, useMemo } from "react";
import {
  CallbackProperty,
  Cartesian3,
  Color,
  ColorMaterialProperty,
  CustomDataSource,
  HeightReference,
  JulianDate,
  PinBuilder,
  TimeInterval,
  TimeIntervalCollectionProperty,
  VerticalOrigin,
  type Entity,
} from "cesium";
import type {
  AnalysisRecordDto,
  PlantHealthStatus,
  PlantOverviewDto,
} from "@DeparkHackaton/dto";
import { useGroundHeights } from "@components/map3d/use-ground-heights";
import { useViewer } from "@components/map3d/viewer-context";
import { ENTITY_ID } from "@/lib/map3d/selection";
import {
  POLE_HEIGHT_M,
  severityToStatus,
  STATUS_HEX,
  STATUS_ORDER,
  worstStatus,
} from "@/lib/map3d/status";

const STATUS_COLOR = Object.fromEntries(
  STATUS_ORDER.map((s) => [s, Color.fromCssColorString(STATUS_HEX[s])]),
) as Record<PlantHealthStatus, Color>;

const PIN_SIZE = 44;
const PULSE_PERIOD_MS = 900;
const PULSE_FRAME_MS = 60;
const CLUSTER_PIXEL_RANGE = 45;
const FAR_PAST = JulianDate.fromIso8601("1900-01-01T00:00:00Z");
const FAR_FUTURE = JulianDate.fromIso8601("2200-01-01T00:00:00Z");

// A white disc with a dark ring. The billboard color tints it, the ring stays dark.
let pinImage: string | undefined;
function getPinImage() {
  if (pinImage) return pinImage;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = PIN_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(PIN_SIZE / 2, PIN_SIZE / 2, PIN_SIZE / 2 - 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#111827";
  ctx.stroke();
  return (pinImage = canvas.toDataURL());
}

/**
 * Status of a plant over time, one interval per analysis record: it holds the
 * severity of that record until the next one. Before the first record the
 * plant has no known status.
 */
export function statusTimeline(records: AnalysisRecordDto[]) {
  const timeline = new TimeIntervalCollectionProperty();
  const sorted = [...records].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const steps = sorted.map((record) => ({
    at: JulianDate.fromIso8601(record.createdAt),
    status: severityToStatus((record.assessment as { severity?: unknown }).severity),
  }));
  const add = (start: JulianDate, stop: JulianDate, data: PlantHealthStatus) =>
    timeline.intervals.addInterval(
      new TimeInterval({ start, stop, isStopIncluded: false, data }),
    );

  if (steps.length === 0) {
    add(FAR_PAST, FAR_FUTURE, "unknown");
    return timeline;
  }
  add(FAR_PAST, steps[0]!.at, "unknown");
  steps.forEach((step, i) => {
    add(step.at, steps[i + 1]?.at ?? FAR_FUTURE, step.status);
  });
  return timeline;
}

interface PlantLayerProps {
  plants: PlantOverviewDto[];
  records: AnalysisRecordDto[];
  showPoles: boolean;
  selectedId: string | null;
}

// A pin per plant, tinted by its health. The tint follows the clock, so moving
// the time slider replays how the plants got sick. Critical plants pulse and
// close pins merge into a numbered cluster. Poles are taller for worse status.
export default function PlantLayer({
  plants,
  records,
  showPoles,
  selectedId,
}: PlantLayerProps) {
  const viewer = useViewer();

  const located = useMemo(
    () =>
      plants.flatMap((plant) =>
        plant.location ? [{ plant, point: plant.location }] : [],
      ),
    [plants],
  );
  const points = useMemo(() => located.map((l) => l.point), [located]);
  const ground = useGroundHeights(points);
  const hasCritical = located.some((l) => l.plant.status === "critical");

  useEffect(() => {
    const recordsByPlant = new Map<string, AnalysisRecordDto[]>();
    for (const record of records) {
      if (!record.plantId) continue;
      recordsByPlant.set(record.plantId, [
        ...(recordsByPlant.get(record.plantId) ?? []),
        record,
      ]);
    }

    const pins = new CustomDataSource("plant-pins");
    const poles = new CustomDataSource("plant-poles");
    const currentStatus = new Map<string, PlantHealthStatus>();
    pins.clustering.enabled = true;
    pins.clustering.pixelRange = CLUSTER_PIXEL_RANGE;
    pins.clustering.minimumClusterSize = 3;

    located.forEach(({ plant, point }, i) => {
      const timeline = statusTimeline(recordsByPlant.get(plant.id) ?? []);
      const statusAt = (time: JulianDate): PlantHealthStatus =>
        timeline.getValue(time) ?? "unknown";
      const color = new CallbackProperty(
        (time) => STATUS_COLOR[statusAt(time!)],
        false,
      );
      const selected = plant.id === selectedId;
      currentStatus.set(ENTITY_ID.plant + plant.id, plant.status);

      pins.entities.add({
        id: ENTITY_ID.plant + plant.id,
        name: plant.name,
        position: Cartesian3.fromDegrees(point.lng, point.lat),
        billboard: {
          image: getPinImage(),
          color,
          scale: new CallbackProperty((time) => {
            const pulse =
              statusAt(time!) === "critical"
                ? 0.3 * Math.abs(Math.sin((performance.now() / PULSE_PERIOD_MS) * Math.PI))
                : 0;
            return (selected ? 1.35 : 1) + pulse;
          }, false),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      if (showPoles) {
        const base = ground[i]!;
        poles.entities.add({
          id: ENTITY_ID.pole + plant.id,
          name: plant.name,
          polyline: {
            positions: Cartesian3.fromDegreesArrayHeights([
              point.lng,
              point.lat,
              base,
              point.lng,
              point.lat,
              base + POLE_HEIGHT_M[plant.status],
            ]),
            width: selected ? 8 : 5,
            material: new ColorMaterialProperty(color),
          },
        });
      }
    });

    // a cluster is as bad as the worst plant inside it
    const pinBuilder = new PinBuilder();
    pins.clustering.clusterEvent.addEventListener((entities: Entity[], cluster) => {
      const worst =
        worstStatus(entities.map((e) => currentStatus.get(String(e.id)) ?? "unknown")) ??
        "unknown";
      cluster.label.show = false;
      cluster.billboard.show = true;
      cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
      cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
      cluster.billboard.image = pinBuilder
        .fromText(String(entities.length), STATUS_COLOR[worst], 52)
        .toDataURL();
    });

    const addedPins = viewer.dataSources.add(pins);
    const addedPoles = viewer.dataSources.add(poles);
    return () => {
      if (!viewer.isDestroyed()) {
        void addedPins.then(() => viewer.dataSources.remove(pins, true));
        void addedPoles.then(() => viewer.dataSources.remove(poles, true));
      }
    };
  }, [viewer, located, records, showPoles, selectedId, ground]);

  // requestRenderMode only draws on changes, the pulse needs frames
  useEffect(() => {
    if (!hasCritical) return;
    const timer = setInterval(() => {
      if (!document.hidden) viewer.scene.requestRender();
    }, PULSE_FRAME_MS);
    return () => clearInterval(timer);
  }, [viewer, hasCritical]);

  return null;
}
