// Layers picked from the GWIS WMS 1.3.0 capabilities (docs/gwis-docs.xml).
export const GWIS_WMS_URL = "https://maps.effis.emergency.copernicus.eu/gwis";

export const GWIS_ATTRIBUTION =
  '&copy; <a href="https://gwis.jrc.ec.europa.eu">GWIS</a> / Copernicus EMS, JRC';

export interface GwisLayer {
  // layer <Name> in the capabilities document
  name: string;
  label: string;
  // layer declares a <Dimension name="time">, so it accepts a TIME parameter
  timeEnabled?: boolean;
  opacity?: number;
  // shown on first render
  checked?: boolean;
}

export interface GwisLayerGroup {
  label: string;
  layers: GwisLayer[];
}

export const GWIS_LAYER_GROUPS: GwisLayerGroup[] = [
  {
    label: "Fire weather (ECMWF)",
    layers: [
      { name: "ecmwf.fwi", label: "Fire Weather Index", timeEnabled: true, opacity: 0.7, checked: true },
      { name: "ecmwf.ffmc", label: "Fine Fuel Moisture Code", timeEnabled: true, opacity: 0.7 },
      { name: "ecmwf.dmc", label: "Duff Moisture Code", timeEnabled: true, opacity: 0.7 },
      { name: "ecmwf.dc", label: "Drought Code", timeEnabled: true, opacity: 0.7 },
      { name: "ecmwf.isi", label: "Initial Spread Index", timeEnabled: true, opacity: 0.7 },
      { name: "ecmwf.bui", label: "Buildup Index", timeEnabled: true, opacity: 0.7 },
      { name: "ecmwf.anomaly", label: "FWI anomaly", timeEnabled: true, opacity: 0.7 },
    ],
  },
  {
    label: "Active fires",
    layers: [
      { name: "all.hs.today", label: "Hotspots, last 24 hours" },
      { name: "all.hs.week", label: "Hotspots, last 7 days" },
      { name: "all.hs.month", label: "Hotspots, last 30 days" },
    ],
  },
  {
    label: "Burnt areas",
    layers: [
      { name: "nrt.ba.today", label: "Burnt areas, last 24 hours" },
      { name: "nrt.ba.week", label: "Burnt areas, last 7 days" },
      { name: "nrt.ba.month", label: "Burnt areas, last 30 days" },
    ],
  },
  {
    label: "Land",
    layers: [
      { name: "fuel_map", label: "Global fuel map", opacity: 0.7 },
      { name: "landcover.mcd12.2024", label: "Land cover (MODIS, 2024)", opacity: 0.7 },
      { name: "wdpa.poly", label: "Protected areas (WDPA)", opacity: 0.7 },
      { name: "ghsl", label: "Built-up areas (GHSL)", opacity: 0.7 },
    ],
  },
];
