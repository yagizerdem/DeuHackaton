const API_URL = import.meta.env.VITE_API_BASE_URL;

export type RiskLevel = "very_low" | "low" | "moderate" | "high" | "very_high";

export type FireRiskAssessment = {
  location: { lat: number; lon: number };
  structural: {
    burnRatio: number | null;
    level: RiskLevel | null;
    landCover: { worldCoverClass: number; label: string };
    terrain: { elevationM: number | null; slopeDeg: number | null; slopePct: number | null };
  };
  weather:
    | {
        available: true;
        fwi: number;
        dangerClass: number;
        dangerLabel: string;
        date: string;
        source: string;
      }
    | { available: false; reason: string };
};

/** Structural levels are Turkey land area quintiles (each covers 20 % of the land). */
export const LEVEL_STYLE: Record<RiskLevel, { label: string; color: string }> = {
  very_low: { label: "Çok düşük", color: "#16a34a" },
  low: { label: "Düşük", color: "#84cc16" },
  moderate: { label: "Orta", color: "#eab308" },
  high: { label: "Yüksek", color: "#f97316" },
  very_high: { label: "Çok yüksek", color: "#dc2626" },
};

/** EFFIS fire danger classes, 0..5 */
export const DANGER_STYLE = [
  { label: "Çok düşük", color: "#16a34a" },
  { label: "Düşük", color: "#84cc16" },
  { label: "Orta", color: "#eab308" },
  { label: "Yüksek", color: "#f97316" },
  { label: "Çok yüksek", color: "#dc2626" },
  { label: "Ekstrem", color: "#7f1d1d" },
];

export async function fetchFireRisk(
  lat: number,
  lon: number,
  date?: string,
  signal?: AbortSignal,
): Promise<FireRiskAssessment> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  if (date) params.set("date", date);
  const res = await fetch(`${API_URL}/risk?${params}`, { signal });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.issues?.join(", ") || body?.message || res.statusText);
  }
  return body.data as FireRiskAssessment;
}
