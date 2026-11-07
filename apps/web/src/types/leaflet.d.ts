// The import makes this file a module, so the block below augments
// @types/leaflet instead of replacing it.
import "leaflet";

declare module "leaflet" {
  // GWIS layers are time-dimensioned (WMS `time` parameter)
  interface WMSParams {
    time?: string | undefined;
  }
}
