import { useEffect } from "react";
import {
  CallbackProperty,
  Cartesian3,
  Cartographic,
  Color,
  CustomDataSource,
  HeightReference,
  Math as CesiumMath,
  PolygonHierarchy,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium";
import { useViewer } from "@components/map3d/viewer-context";
import type { LngLat } from "@/lib/map3d/geometry";

const DRAW_COLOR = Color.fromCssColorString("#0ea5e9");
// a double click also sends two clicks, corners closer than this are one corner
const MIN_CORNER_GAP_M = 2;
const MIN_CORNERS = 3;
const MAX_CORNERS = 100;

interface DrawToolProps {
  active: boolean;
  onFinish: (polygon: LngLat[]) => void;
  onCancel: () => void;
}

// Click to add corners, double click or right click to finish, Backspace removes
// the last corner and Escape cancels. The corners sit on the terrain surface.
export default function DrawTool({ active, onFinish, onCancel }: DrawToolProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!active) return;

    const { scene, camera } = viewer;
    const corners: Cartesian3[] = [];
    let hover: Cartesian3 | undefined;

    const source = new CustomDataSource("draw");
    const outline = () => (hover ? [...corners, hover] : [...corners]);
    source.entities.add({
      // no height and clamped: the preview drapes over the terrain like the result
      polygon: {
        hierarchy: new CallbackProperty(() => new PolygonHierarchy(outline()), false),
        material: DRAW_COLOR.withAlpha(0.3),
      },
      polyline: {
        positions: new CallbackProperty(() => {
          const line = outline();
          return line.length > 2 ? [...line, line[0]!] : line;
        }, false),
        width: 3,
        material: DRAW_COLOR,
        clampToGround: true,
      },
    });
    const cornerSource = new CustomDataSource("draw-corners");
    const added = viewer.dataSources.add(source);
    const addedCorners = viewer.dataSources.add(cornerSource);

    const pick = (position: Cartesian3 | { x: number; y: number }) => {
      const ray = camera.getPickRay(position as never);
      const onTerrain = ray ? scene.globe.pick(ray, scene) : undefined;
      return onTerrain ?? camera.pickEllipsoid(position as never, scene.globe.ellipsoid);
    };

    const handler = new ScreenSpaceEventHandler(scene.canvas);
    const previousCursor = scene.canvas.style.getPropertyValue("cursor");
    scene.canvas.style.setProperty("cursor", "crosshair");

    const redraw = () => {
      cornerSource.entities.removeAll();
      corners.forEach((corner) =>
        cornerSource.entities.add({
          position: corner,
          point: {
            pixelSize: 9,
            color: Color.WHITE,
            outlineColor: DRAW_COLOR,
            outlineWidth: 3,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        }),
      );
      scene.requestRender();
    };

    const finish = () => {
      if (corners.length < MIN_CORNERS) return;
      onFinish(
        corners.map((corner) => {
          const c = Cartographic.fromCartesian(corner);
          return [CesiumMath.toDegrees(c.longitude), CesiumMath.toDegrees(c.latitude)];
        }),
      );
    };

    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const point = pick(event.position);
      const last = corners[corners.length - 1];
      if (!point || corners.length >= MAX_CORNERS) return;
      if (last && Cartesian3.distance(last, point) < MIN_CORNER_GAP_M) return;
      corners.push(point);
      redraw();
    }, ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction((event: ScreenSpaceEventHandler.MotionEvent) => {
      hover = pick(event.endPosition);
      scene.requestRender();
    }, ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(finish, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handler.setInputAction(finish, ScreenSpaceEventType.RIGHT_CLICK);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Backspace" && corners.length) {
        e.preventDefault();
        corners.pop();
        redraw();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      handler.destroy();
      if (viewer.isDestroyed()) return;
      scene.canvas.style.setProperty("cursor", previousCursor);
      void added.then(() => viewer.dataSources.remove(source, true));
      void addedCorners.then(() => viewer.dataSources.remove(cornerSource, true));
    };
  }, [viewer, active, onFinish, onCancel]);

  return null;
}
