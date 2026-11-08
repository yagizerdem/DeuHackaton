import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type {
  BoardTaskDto,
  PlantOverviewDto,
  TaskStatus,
} from "@DeparkHackaton/dto";
import { tagsSchema } from "@DeparkHackaton/validators";
import { Plant } from "@models/plant-entity.js";
import { Task } from "@models/task-entity.js";
import { completeTask } from "@controllers/task-controller.js";
import { ensureValidId } from "@services/farm-service.js";
import {
  getPlantOverview,
  toBoardTaskDto,
} from "@services/farm-overview-service.js";
import { AppError } from "@utils/app-error.js";

const MAX_TAGS_PER_PLANT = 10;

export function createPlantTagsValidator() {
  return z
    .object({
      ids: z.array(z.string()).min(1).max(200),
      add: tagsSchema.optional(),
      remove: tagsSchema.optional(),
    })
    .refine((v) => (v.add?.length ?? 0) + (v.remove?.length ?? 0) > 0, {
      message: "Give at least one tag to add or remove",
    });
}
type PlantTagsInput = z.infer<ReturnType<typeof createPlantTagsValidator>>;

export function createTaskStatusValidator() {
  return z.object({ status: z.enum(["todo", "doing", "done"]) });
}

export async function listPlantOverview(req: Request, res: Response) {
  const overview = await getPlantOverview(req.user!.id);

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok<PlantOverviewDto[]>(overview));
}

// Adds and removes tags on several plants at once. Nothing is written when one
// plant would end up with too many tags.
export async function tagPlants(req: Request, res: Response) {
  const { ids, add = [], remove = [] } = req.body as PlantTagsInput;
  const owner = req.user!.id;
  const uniqueIds = [...new Set(ids.map(ensureValidId))];

  const plants = await Plant.find({ _id: { $in: uniqueIds }, owner });
  if (plants.length !== uniqueIds.length) {
    throw AppError.notFound("Some plants were not found");
  }

  const updates = plants.map((plant) => {
    const tags = [
      ...new Set([...plant.tags.filter((t) => !remove.includes(t)), ...add]),
    ];
    if (tags.length > MAX_TAGS_PER_PLANT) {
      throw AppError.unprocessableEntity(
        `${plant.name} would have more than ${MAX_TAGS_PER_PLANT} tags`,
      );
    }
    return {
      updateOne: { filter: { _id: plant._id, owner }, update: { tags } },
    };
  });
  await Plant.bulkWrite(updates);

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok({ updated: plants.length }, "Tags updated"));
}

export async function listBoard(req: Request, res: Response) {
  const tasks = await Task.find({ owner: req.user!.id }).sort({
    done: 1,
    dueDate: 1,
  });

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok<BoardTaskDto[]>(tasks.map(toBoardTaskDto)));
}

// Moves a task between the board columns. Finishing goes through completeTask,
// so a repeating task still gets its next occurrence (response shape of
// POST /api/tasks/:id/complete). todo and doing return the moved task.
export async function moveTask(req: Request, res: Response) {
  const { status } = req.body as { status: TaskStatus };
  const owner = req.user!.id;
  const id = ensureValidId(req.params.id);

  if (status === "done") {
    await Task.updateOne({ _id: id, owner }, { inProgress: false });
    return completeTask(req, res);
  }

  const task = await Task.findOneAndUpdate(
    { _id: id, owner },
    { done: false, inProgress: status === "doing", $unset: { doneAt: 1 } },
    { returnDocument: "after" },
  );
  if (!task) throw AppError.notFound("Task not found");

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toBoardTaskDto(task), "Task moved"));
}
