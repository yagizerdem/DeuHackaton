import type { PlantHealthStatus, PlantOverviewDto } from "@DeparkHackaton/dto";

export const STATUS_LABEL: Record<PlantHealthStatus, string> = {
  healthy: "Sağlıklı",
  watching: "İzleniyor",
  treating: "Tedavide",
  critical: "Kritik",
  unknown: "Analiz yok",
};

export const STATUS_HEX: Record<PlantHealthStatus, string> = {
  healthy: "#16a34a",
  watching: "#eab308",
  treating: "#f97316",
  critical: "#dc2626",
  unknown: "#94a3b8",
};

/** Most urgent first. */
export const STATUS_ORDER: PlantHealthStatus[] = [
  "critical",
  "treating",
  "watching",
  "healthy",
  "unknown",
];

// the same mapping as the backend uses for the plant overview
export function severityToStatus(severity: unknown): PlantHealthStatus {
  switch (severity) {
    case "none":
      return "healthy";
    case "low":
      return "watching";
    case "medium":
    case "high":
      return "treating";
    case "critical":
      return "critical";
    default:
      return "unknown";
  }
}

/** Height of the health pole above the plant, a worse status is taller. */
export const POLE_HEIGHT_M: Record<PlantHealthStatus, number> = {
  critical: 120,
  treating: 80,
  watching: 50,
  healthy: 30,
  unknown: 20,
};

export function worstStatus(
  statuses: PlantHealthStatus[],
): PlantHealthStatus | null {
  for (const status of STATUS_ORDER) {
    if (statuses.includes(status) && status !== "unknown") return status;
  }
  return statuses.length ? "unknown" : null;
}

export interface ParcelStats {
  plants: number;
  counts: Record<PlantHealthStatus, number>;
  worst: PlantHealthStatus | null;
  openTasks: number;
  /** problem density, drives the height of an extruded parcel */
  score: number;
}

const SCORE_WEIGHT: Record<PlantHealthStatus, number> = {
  critical: 3,
  treating: 2,
  watching: 1,
  healthy: 0,
  unknown: 0,
};
const OPEN_TASK_WEIGHT = 0.5;

export const EXTRUDE_BASE_M = 20;
export const EXTRUDE_PER_POINT_M = 25;
export const EXTRUDE_MAX_M = 400;

export const extrudeHeightM = (score: number) =>
  Math.min(EXTRUDE_MAX_M, EXTRUDE_BASE_M + score * EXTRUDE_PER_POINT_M);

export function parcelStats(
  plants: PlantOverviewDto[],
): Map<string, ParcelStats> {
  const byParcel = new Map<string, PlantOverviewDto[]>();
  for (const plant of plants) {
    if (!plant.parcelId) continue;
    byParcel.set(plant.parcelId, [...(byParcel.get(plant.parcelId) ?? []), plant]);
  }

  return new Map(
    [...byParcel].map(([parcelId, members]) => {
      const counts = Object.fromEntries(
        STATUS_ORDER.map((s) => [s, members.filter((p) => p.status === s).length]),
      ) as Record<PlantHealthStatus, number>;
      const openTasks = members.reduce((sum, p) => sum + p.openTasks, 0);
      const score =
        STATUS_ORDER.reduce((sum, s) => sum + counts[s] * SCORE_WEIGHT[s], 0) +
        openTasks * OPEN_TASK_WEIGHT;
      return [
        parcelId,
        {
          plants: members.length,
          counts,
          worst: worstStatus(members.map((p) => p.status)),
          openTasks,
          score,
        },
      ];
    }),
  );
}
