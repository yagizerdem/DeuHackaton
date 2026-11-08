import { useEffect } from "react";
import {
  createGooglePhotorealistic3DTileset,
  createOsmBuildingsAsync,
  type Cesium3DTileset,
} from "cesium";
import { toast } from "sonner";
import { useViewer } from "@components/map3d/viewer-context";

export type BuildingsSource = "osm" | "google";

interface BuildingsLayerProps {
  /** null hides the buildings */
  source: BuildingsSource | null;
}

// Both tilesets are Cesium ion assets, the parent only enables this with a token.
export default function BuildingsLayer({ source }: BuildingsLayerProps) {
  const viewer = useViewer();

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    let tileset: Cesium3DTileset | undefined;

    const load =
      source === "osm"
        ? createOsmBuildingsAsync()
        : createGooglePhotorealistic3DTileset({ onlyUsingWithGoogleGeocoder: true });
    load
      .then((loaded) => {
        if (cancelled || viewer.isDestroyed()) {
          loaded.destroy();
          return;
        }
        tileset = loaded;
        viewer.scene.primitives.add(loaded);
        viewer.scene.requestRender();
      })
      .catch(() => toast.error("3B binalar yüklenemedi"));

    return () => {
      cancelled = true;
      if (tileset && !viewer.isDestroyed()) viewer.scene.primitives.remove(tileset);
    };
  }, [viewer, source]);

  return null;
}
