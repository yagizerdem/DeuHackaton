import { today } from "@lib/utils";
import type {
  DamageAssessmentOptions,
  MapBounds,
  TFireForcastDangerSource,
} from "@providers/risk-map-provider";

export const GWIS_WMS = "https://maps.effis.emergency.copernicus.eu/gwis";

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Rapid damage assessment layers                                      */
/* ------------------------------------------------------------------ */

export interface WmsLayerSpec {
  layers: string;
  time?: string;
}

const PERIOD_DAYS = { today: 0, week: 7, month: 30 } as const;

/** [from, to] covered by the selected period, used for queries. */
export function getDamageRange({
  period,
  customFrom,
  customTo,
}: DamageAssessmentOptions): [string, string] {
  const to = today();
  switch (period) {
    case "custom":
      return [customFrom, customTo];
    case "season":
      // GWIS "season" layers cover the current calendar year
      return [`${to.slice(0, 4)}-01-01`, to];
    default:
      return [addDays(to, -PERIOD_DAYS[period]), to];
  }
}

/**
 * GWIS has ready-made `<layer>.today|week|month|season` layers; custom dates
 * use the base layer with a `time` range instead.
 */
function withPeriod(
  base: string,
  { period, customFrom, customTo }: DamageAssessmentOptions,
): WmsLayerSpec {
  if (period === "custom") {
    return { layers: base, time: `${customFrom}/${customTo}` };
  }
  return { layers: `${base}.${period}` };
}

export function getDamageLayerSpecs(
  options: DamageAssessmentOptions,
  selectedDate: string,
): WmsLayerSpec[] {
  const specs: WmsLayerSpec[] = [];

  if (options.showNrtBurntAreas) {
    specs.push(withPeriod("nrt.ba.poly", options));
  }
  if (options.burntComposite === "yearly") {
    specs.push({
      layers: "mcd64a1.annual_composite.c12",
      time: `${selectedDate.slice(0, 4)}-01-01`,
    });
  }
  if (options.burntComposite === "monthly") {
    specs.push({
      layers: "mcd64a1.monthly_composite.c3",
      time: `${selectedDate.slice(0, 7)}-01`,
    });
  }

  if (options.showModis) specs.push(withPeriod("modis.hs", options));
  if (options.showViirs) {
    const sensor =
      options.viirsSensor === "all" ? "" : `.${options.viirsSensor}`;
    specs.push(withPeriod(`viirs.hs${sensor}`, options));
  }
  if (options.showSentinel3) specs.push(withPeriod("s3.hs", options));

  return specs;
}

/* ------------------------------------------------------------------ */
/* GetFeatureInfo helpers                                              */
/* ------------------------------------------------------------------ */

function featureInfoUrl(
  layer: string,
  bbox: MapBounds,
  size: number,
  format: string,
  time: string,
  featureCount: number,
) {
  const [south, west, north, east] = bbox;
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.1.1",
    request: "GetFeatureInfo",
    srs: "EPSG:4326",
    styles: "",
    layers: layer,
    query_layers: layer,
    bbox: `${west},${south},${east},${north}`,
    width: String(size),
    height: String(size),
    x: String(Math.floor(size / 2)),
    y: String(Math.floor(size / 2)),
    info_format: format,
    feature_count: String(featureCount),
    time,
  });
  return `${GWIS_WMS}?${params}`;
}

async function fetchText(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`GWIS ${res.status}`);
  return res.text();
}

/* ------------------------------------------------------------------ */
/* Fire danger chart                                                   */
/* ------------------------------------------------------------------ */

export interface FireDangerSeries {
  label: string;
  data: { date: string; value: number }[];
}

const CHART_DAYS_BEFORE = 2;
const CHART_DAYS_AFTER = 9;

function parseIndexTables(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("table#main")).map((table) =>
    Array.from(table.querySelectorAll("tr")).map((row) => {
      const [label, value] = Array.from(row.querySelectorAll("td")).map((td) =>
        td.textContent?.trim(),
      );
      return { label: label ?? "", value: Number(value) };
    }),
  );
}

/**
 * `<source>.query` answers a GetFeatureInfo time range with one HTML table
 * per grid cell per day (chronological, same cell count each day). The cell
 * count is taken from a single-day request and cells are averaged per day.
 */
export async function fetchFireDangerSeries(
  lat: number,
  lng: number,
  source: TFireForcastDangerSource,
  centerDate: string,
  signal?: AbortSignal,
): Promise<FireDangerSeries[]> {
  const delta = 0.01;
  const bbox: MapBounds = [lat - delta, lng - delta, lat + delta, lng + delta];
  const layer = `${source}.query`;
  const from = addDays(centerDate, -CHART_DAYS_BEFORE);
  const to = addDays(centerDate, CHART_DAYS_AFTER);

  const [rangeHtml, dayHtml] = await Promise.all([
    fetchText(
      featureInfoUrl(layer, bbox, 3, "text/html", `${from}/${to}`, 500),
      signal,
    ),
    fetchText(featureInfoUrl(layer, bbox, 3, "text/html", from, 50), signal),
  ]);

  const tables = parseIndexTables(rangeHtml);
  const cellsPerDay = parseIndexTables(dayHtml).length;
  if (!cellsPerDay || tables.length < cellsPerDay) {
    throw new Error("No fire danger data for this location");
  }

  const days = Math.floor(tables.length / cellsPerDay);
  const byLabel = new Map<string, FireDangerSeries>();

  for (let day = 0; day < days; day++) {
    const date = addDays(from, day);
    const cells = tables.slice(day * cellsPerDay, (day + 1) * cellsPerDay);
    const sums = new Map<string, { sum: number; count: number }>();
    for (const row of cells.flat()) {
      if (!row.label || !Number.isFinite(row.value)) continue;
      const acc = sums.get(row.label) ?? { sum: 0, count: 0 };
      acc.sum += row.value;
      acc.count += 1;
      sums.set(row.label, acc);
    }
    for (const [label, { sum, count }] of sums) {
      const series = byLabel.get(label) ?? { label, data: [] };
      series.data.push({ date, value: sum / count });
      byLabel.set(label, series);
    }
  }
  return [...byLabel.values()];
}

/* ------------------------------------------------------------------ */
/* Burnt area locator                                                  */
/* ------------------------------------------------------------------ */

export interface BurntArea {
  id: string;
  startDate: string;
  lastUpdate: string;
  areaHa: number;
  /** [south, west, north, east] */
  bounds: MapBounds;
}

function childText(el: Element, tag: string) {
  return el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
}

export async function fetchBurntAreas(
  bounds: MapBounds,
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<BurntArea[]> {
  const xml = await fetchText(
    featureInfoUrl(
      "nrt.ba.query",
      bounds,
      400,
      "application/vnd.ogc.gml",
      `${from}/${to}`,
      50,
    ),
    signal,
  );
  const doc = new DOMParser().parseFromString(xml, "text/xml");

  return Array.from(doc.getElementsByTagName("nrt.ba.query_feature")).flatMap(
    (feature) => {
      // "west,south east,north"
      const coords = childText(feature, "gml:coordinates")
        .split(/[\s,]+/)
        .map(Number);
      if (coords.length !== 4 || coords.some(Number.isNaN)) return [];
      const [west, south, east, north] = coords;
      return [
        {
          id: childText(feature, "id"),
          startDate: childText(feature, "initialdate"),
          lastUpdate: childText(feature, "finaldate"),
          areaHa: Number(childText(feature, "area_ha")),
          bounds: [south, west, north, east] as MapBounds,
        },
      ];
    },
  );
}
