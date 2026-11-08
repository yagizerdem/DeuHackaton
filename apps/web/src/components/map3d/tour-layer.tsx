import { useEffect } from "react";
import {
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Color,
  CustomDataSource,
  HeadingPitchRange,
  HeightReference,
  Math as CesiumMath,
  PinBuilder,
  VerticalOrigin,
  type Viewer,
} from "cesium";
import { useViewer } from "@components/map3d/viewer-context";
import { toLocalMeters } from "@/lib/map3d/geometry";
import type { TourStop } from "@/lib/map3d/tour";

const ROUTE_COLOR = Color.fromCssColorString("#f59e0b");
const FLIGHT_SECONDS = 3;
const STOP_PAUSE_MS = 1600;
const VIEW_RANGE_M = 350;
const VIEW_PITCH_DEG = -35;

interface TourLayerProps {
  stops: TourStop[];
  /** draw the route and the numbered stops */
  show: boolean;
  /** fly along the route */
  running: boolean;
  onActive: (index: number | null) => void;
  onFinished: () => void;
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

// flyTo does not return a promise, it reports through callbacks
function flyToStop(viewer: Viewer, stop: TourStop, next: TourStop | undefined) {
  // look along the way to the next stop, the last one keeps facing north
  const ahead = next ? toLocalMeters(stop, next) : null;
  const heading = ahead ? Math.atan2(ahead.x, ahead.y) : 0;
  return new Promise<void>((resolve) => {
    viewer.camera.flyToBoundingSphere(
      new BoundingSphere(Cartesian3.fromDegrees(stop.lng, stop.lat), 0),
      {
        offset: new HeadingPitchRange(
          heading,
          CesiumMath.toRadians(VIEW_PITCH_DEG),
          VIEW_RANGE_M,
        ),
        duration: FLIGHT_SECONDS,
        complete: resolve,
        cancel: resolve,
      },
    );
  });
}

// The route of the day: a line through the plants that have tasks due, numbered
// in walking order. While running, the camera flies from stop to stop.
export default function TourLayer({
  stops,
  show,
  running,
  onActive,
  onFinished,
}: TourLayerProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!show || stops.length === 0) return;

    const source = new CustomDataSource("tour");
    const pins = new PinBuilder();
    if (stops.length > 1) {
      source.entities.add({
        name: "Saha turu",
        polyline: {
          positions: Cartesian3.fromDegreesArray(stops.flatMap((s) => [s.lng, s.lat])),
          width: 5,
          material: ROUTE_COLOR,
          clampToGround: true,
        },
      });
    }
    stops.forEach((stop, i) => {
      source.entities.add({
        name: `${i + 1}. ${stop.plantName}`,
        position: Cartesian3.fromDegrees(stop.lng, stop.lat),
        billboard: {
          image: pins.fromText(String(i + 1), ROUTE_COLOR, 44).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          // float above the plant pin that sits on the same spot
          pixelOffset: new Cartesian2(0, -46),
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    });

    const added = viewer.dataSources.add(source);
    return () => {
      if (!viewer.isDestroyed()) {
        void added.then(() => viewer.dataSources.remove(source, true));
      }
    };
  }, [viewer, show, stops]);

  useEffect(() => {
    if (!running || stops.length === 0) return;
    const abort = new AbortController();

    void (async () => {
      for (let i = 0; i < stops.length && !abort.signal.aborted; i++) {
        onActive(i);
        await flyToStop(viewer, stops[i]!, stops[i + 1]);
        await wait(STOP_PAUSE_MS, abort.signal);
      }
      if (!abort.signal.aborted) {
        onActive(null);
        onFinished();
      }
    })();

    return () => {
      abort.abort();
      if (!viewer.isDestroyed()) viewer.camera.cancelFlight();
    };
  }, [viewer, running, stops, onActive, onFinished]);

  return null;
}
