import type { BuildingsSource } from "@components/map3d/buildings-layer";
import type { ParcelStyle } from "@components/map3d/parcel-layer";

export interface LayerState {
  parcels: boolean;
  parcelStyle: ParcelStyle;
  plants: boolean;
  poles: boolean;
  threats: boolean;
  burntAreas: boolean;
  fireWeather: boolean;
  landCover: boolean;
  buildings: BuildingsSource | null;
  timeMode: boolean;
  tourRoute: boolean;
  /** opacity of the fire and land cover layers */
  overlayOpacity: number;
}

export const DEFAULT_LAYERS: LayerState = {
  parcels: true,
  parcelStyle: "ground",
  plants: true,
  poles: true,
  threats: true,
  burntAreas: false,
  fireWeather: false,
  landCover: false,
  buildings: null,
  timeMode: false,
  tourRoute: false,
  overlayOpacity: 0.7,
};
