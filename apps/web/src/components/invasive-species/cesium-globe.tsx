import { useCallback, useState } from "react";
import {
  ImageryLayer,
  OpenStreetMapImageryProvider,
  Viewer,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { ViewerContext } from "@components/invasive-species/viewer-context";
import { cn } from "@/lib/utils";

interface CesiumGlobeProps {
  /** layers that draw into the viewer, see viewer-context */
  children?: React.ReactNode;
  className?: string;
}

// Owns the Cesium Viewer. It uses public OpenStreetMap imagery and a flat
// ellipsoid, so it works without a Cesium ion token.
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
      animation: false,
      timeline: false,
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
