import { useEffect, useRef } from "react";
import { ImageryLayer, WebMapServiceImageryProvider } from "cesium";
import { useViewer } from "@components/map3d/viewer-context";
import { GWIS_WMS } from "@lib/gwis";
import { today } from "@lib/utils";

const CORINE_WMS =
  "https://image.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer";

interface OverlaySpec {
  url: string;
  layers: string;
  time?: string;
  credit: string;
}

// One WMS layer draped over the globe while `enabled`. The opacity changes
// without rebuilding the layer, so dragging the slider does not reload tiles.
function useWmsOverlay(
  enabled: boolean,
  spec: OverlaySpec,
  opacity: number,
) {
  const viewer = useViewer();
  const layerRef = useRef<ImageryLayer | null>(null);
  const opacityRef = useRef(opacity);

  useEffect(() => {
    opacityRef.current = opacity;
    if (layerRef.current) {
      layerRef.current.alpha = opacity;
      viewer.scene.requestRender();
    }
  }, [viewer, opacity]);

  const { url, layers, time, credit } = spec;
  useEffect(() => {
    if (!enabled) return;

    const layer = new ImageryLayer(
      new WebMapServiceImageryProvider({
        url,
        layers,
        credit,
        parameters: { transparent: true, format: "image/png", ...(time && { time }) },
      }),
      { alpha: opacityRef.current },
    );
    viewer.imageryLayers.add(layer);
    layerRef.current = layer;

    return () => {
      layerRef.current = null;
      if (!viewer.isDestroyed()) viewer.imageryLayers.remove(layer);
    };
  }, [viewer, enabled, url, layers, time, credit]);
}

interface ImageryOverlaysProps {
  burntAreas: boolean;
  fireWeather: boolean;
  landCover: boolean;
  opacity: number;
}

// The fire layers are the same GWIS services the 2D map uses, the land cover
// is CORINE 2018. They drape over the terrain like any other imagery.
export default function ImageryOverlays({
  burntAreas,
  fireWeather,
  landCover,
  opacity,
}: ImageryOverlaysProps) {
  useWmsOverlay(
    landCover,
    { url: CORINE_WMS, layers: "12", credit: "Copernicus Land Monitoring Service / EEA" },
    opacity,
  );
  useWmsOverlay(
    fireWeather,
    { url: GWIS_WMS, layers: "ecmwf.fwi", time: today(), credit: "GWIS" },
    opacity,
  );
  useWmsOverlay(
    burntAreas,
    { url: GWIS_WMS, layers: "nrt.ba.poly.month", credit: "GWIS" },
    opacity,
  );
  return null;
}
