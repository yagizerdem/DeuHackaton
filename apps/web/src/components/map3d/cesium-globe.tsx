import { useCallback, useState } from "react";
import {
  ImageryLayer,
  Ion,
  OpenStreetMapImageryProvider,
  ScreenSpaceEventType,
  Terrain,
  Viewer,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { ViewerContext } from "@components/map3d/viewer-context";
import { cn } from "@/lib/utils";

// Cesium World Terrain, 3D buildings and photorealistic tiles are Cesium ion
// assets. Without a (free) token the globe stays flat on public OSM imagery.
const ION_TOKEN: string | undefined = import.meta.env.VITE_CESIUM_ION_TOKEN;
export const HAS_ION_TOKEN = Boolean(ION_TOKEN);
if (ION_TOKEN) Ion.defaultAccessToken = ION_TOKEN;

interface CesiumGlobeProps {
  /** layers that draw into the viewer, see viewer-context */
  children?: React.ReactNode;
  className?: string;
}

// Owns the Cesium Viewer. The animation and timeline widgets exist from the
// start and stay hidden until the time mode shows them.
export default function CesiumGlobe({ children, className }: CesiumGlobeProps) {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  // a ref callback with a cleanup: the viewer is created when the div mounts
  // and destroyed when it unmounts, which also covers React strict mode
  const containerRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;

    const created = new Viewer(element, {
      baseLayer: new ImageryLayer(
        new OpenStreetMapImageryProvider({
          url: "https://tile.openstreetmap.org/",
        }),
      ),
      terrain: ION_TOKEN
        ? Terrain.fromWorldTerrain({ requestVertexNormals: true })
        : undefined,
      animation: true,
      timeline: true,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      // draw only when something changed
      requestRenderMode: true,
    });
    created.scene.globe.depthTestAgainstTerrain = true;
    // a double click would start tracking an entity, the drawing tool needs it
    created.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );
    (created.animation.container as HTMLElement).style.display = "none";
    (created.timeline.container as HTMLElement).style.display = "none";

    // handle for browser tests and for debugging in the console
    if (import.meta.env.DEV) {
      (window as unknown as { __map3d?: Viewer }).__map3d = created;
    }
    setViewer(created);

    return () => {
      setViewer(null);
      created.destroy();
    };
  }, []);

  return (
    <div className={cn("relative size-full", className)}>
      <div ref={containerRef} className="size-full" />
      {viewer && (
        <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
      )}
    </div>
  );
}
