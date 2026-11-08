import mongoose from "mongoose";
import type {
  BoardTaskDto,
  PlantHealthStatus,
  PlantOverviewDto,
} from "@DeparkHackaton/dto";
import { AnalysisRecord } from "@models/analysis-record-entity.js";
import { Plant } from "@models/plant-entity.js";
import { Task } from "@models/task-entity.js";
import { toPlantDto, toTaskDto } from "@services/farm-service.js";

/** severity comes from the assessment saved with an analysis record */
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

type PlantRef = { _id: mongoose.Types.ObjectId };
type LatestRecord = PlantRef & {
  recordId: mongoose.Types.ObjectId;
  severity: unknown;
  createdAt: Date;
};

export async function getPlantOverview(
  owner: string,
): Promise<PlantOverviewDto[]> {
  // aggregate() does not cast ids like find() does
  const ownerId = new mongoose.Types.ObjectId(owner);

  const [plants, latest, openTasks] = await Promise.all([
    Plant.find({ owner }).sort({ updatedAt: -1 }),
    AnalysisRecord.aggregate<LatestRecord>([
      { $match: { owner: ownerId, plantId: { $ne: null } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$plantId",
          recordId: { $first: "$_id" },
          severity: { $first: "$assessment.severity" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]),
    Task.aggregate<PlantRef & { count: number }>([
      { $match: { owner: ownerId, done: false, plantId: { $ne: null } } },
      { $group: { _id: "$plantId", count: { $sum: 1 } } },
    ]),
  ]);

  const latestByPlant = new Map(latest.map((l) => [l._id.toString(), l]));
  const openByPlant = new Map(openTasks.map((t) => [t._id.toString(), t.count]));

  return plants.map((plant) => {
    const key = plant._id.toString();
    const record = latestByPlant.get(key);
    return {
      ...toPlantDto(plant),
      tags: plant.tags,
      status: severityToStatus(record?.severity),
      lastAnalysis: record && {
        id: record.recordId.toString(),
        severity: String(record.severity),
        createdAt: record.createdAt.toISOString(),
      },
      openTasks: openByPlant.get(key) ?? 0,
    };
  });
}

export function toBoardTaskDto(
  task: Parameters<typeof toTaskDto>[0] & { inProgress?: boolean | null },
): BoardTaskDto {
  return {
    ...toTaskDto(task),
    status: task.done ? "done" : task.inProgress ? "doing" : "todo",
  };
}
