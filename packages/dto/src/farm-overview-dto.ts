import type { PlantDto, TaskDto } from "./farm-dto.js";

/** Derived from the severity of the latest analysis record of the plant. */
export type PlantHealthStatus =
  | "healthy"
  | "watching"
  | "treating"
  | "critical"
  | "unknown";

export interface PlantOverviewDto extends PlantDto {
  tags: string[];
  status: PlantHealthStatus;
  lastAnalysis?: { id: string; severity: string; createdAt: string };
  // tasks of this plant that are not done yet
  openTasks: number;
}

export type TaskStatus = "todo" | "doing" | "done";

export interface BoardTaskDto extends TaskDto {
  status: TaskStatus;
}
