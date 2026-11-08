import { Request, Response } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type { TaskCompletionDto, TaskDto } from "@DeparkHackaton/dto";
import type { TaskInput, TaskUpdateInput } from "@DeparkHackaton/validators";
import { Task } from "@models/task-entity.js";
import { Plant } from "@models/plant-entity.js";
import { Parcel } from "@models/parcel-entity.js";
import {
  applyPatch,
  ensureOwnedRef,
  ensureValidId,
  nextDueDate,
  toTaskDto,
} from "@services/farm-service.js";
import { AppError } from "@utils/app-error.js";

async function findTask(req: Request) {
  const task = await Task.findOne({
    _id: ensureValidId(req.params.id),
    owner: req.user!.id,
  });
  if (!task) throw AppError.notFound("Task not found");
  return task;
}

export async function listTasks(req: Request, res: Response) {
  const filter: Record<string, unknown> = { owner: req.user!.id };
  const { done, plantId, parcelId } = req.query;
  if (done === "true" || done === "false") filter.done = done === "true";
  if (typeof plantId === "string") filter.plantId = ensureValidId(plantId);
  if (typeof parcelId === "string") filter.parcelId = ensureValidId(parcelId);

  // open tasks by due date first, finished ones after them
  const tasks = await Task.find(filter).sort({ done: 1, dueDate: 1 });

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok<TaskDto[]>(tasks.map(toTaskDto)));
}

export async function createTask(req: Request, res: Response) {
  const input = req.body as TaskInput;
  const owner = req.user!.id;
  await ensureOwnedRef(Plant, input.plantId, owner, "Plant");
  await ensureOwnedRef(Parcel, input.parcelId, owner, "Parcel");

  const task = new Task({ owner });
  applyPatch(task, { ...input, dueDate: new Date(input.dueDate) });
  await task.save();

  return res
    .status(HttpStatusCode.CREATED)
    .json(ApiResponse.created(toTaskDto(task), "Task created"));
}

export async function updateTask(req: Request, res: Response) {
  const patch = req.body as TaskUpdateInput;
  const owner = req.user!.id;
  await ensureOwnedRef(Plant, patch.plantId, owner, "Plant");
  await ensureOwnedRef(Parcel, patch.parcelId, owner, "Parcel");

  const task = await findTask(req);
  applyPatch(task, {
    ...patch,
    dueDate: patch.dueDate ? new Date(patch.dueDate) : undefined,
  });
  // reopening a task forgets when it was finished
  if (patch.done === false) task.doneAt = undefined;
  await task.save();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toTaskDto(task), "Task updated"));
}

// Marks the task done. A repeating task also gets its next occurrence.
export async function completeTask(req: Request, res: Response) {
  const owner = req.user!.id;
  const id = ensureValidId(req.params.id);

  // the done: false filter makes a double click complete the task only once
  const task = await Task.findOneAndUpdate(
    { _id: id, owner, done: false },
    { done: true, doneAt: new Date() },
    { new: true },
  );

  if (!task) {
    const existing = await Task.findOne({ _id: id, owner });
    if (!existing) throw AppError.notFound("Task not found");
    return res.status(HttpStatusCode.OK).json(
      ApiResponse.ok<TaskCompletionDto>(
        { task: toTaskDto(existing), next: null },
        "Task already completed",
      ),
    );
  }

  const repeat = task.repeat ?? "none";
  const next =
    repeat === "none"
      ? null
      : await Task.create({
          owner,
          title: task.title,
          notes: task.notes,
          dueDate: nextDueDate(task.dueDate, repeat),
          repeat,
          plantId: task.plantId,
          parcelId: task.parcelId,
        });

  return res.status(HttpStatusCode.OK).json(
    ApiResponse.ok<TaskCompletionDto>(
      { task: toTaskDto(task), next: next ? toTaskDto(next) : null },
      "Task completed",
    ),
  );
}

export async function deleteTask(req: Request, res: Response) {
  const task = await findTask(req);
  await task.deleteOne();

  return res.status(HttpStatusCode.OK).json(ApiResponse.ok(null, "Task deleted"));
}
