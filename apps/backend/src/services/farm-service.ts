import mongoose from "mongoose";
import type {
  AnalysisRecordDto,
  ParcelDto,
  PlantDto,
  TaskDto,
  TaskRepeat,
} from "@DeparkHackaton/dto";
import { AppError } from "@utils/app-error.js";

type Id = { toString(): string };
type Nullish<T> = T | null | undefined;

export function ensureValidId(id: unknown): string {
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    throw AppError.notFound();
  }
  return id;
}

// a plantId / parcelId from the client must point at a document the user owns
export async function ensureOwnedRef(
  model: { exists(filter: object): PromiseLike<unknown> },
  id: Nullish<string>,
  owner: string,
  label: string,
) {
  if (!id) return;
  if (!(await model.exists({ _id: id, owner }))) {
    throw AppError.notFound(`${label} not found`);
  }
}

// PATCH semantics: undefined keeps the stored value, null clears it
export function applyPatch(
  doc: { set(path: string, value: unknown): unknown },
  patch: Record<string, unknown>,
) {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    doc.set(key, value === null ? undefined : value);
  }
}

const iso = (date: Date) => date.toISOString();
const optionalId = (id: Nullish<Id>) => (id ? id.toString() : undefined);

export function toPlantDto(plant: {
  _id: Id;
  name: string;
  latinName?: Nullish<string>;
  careNote?: Nullish<string>;
  location?: Nullish<{ lat?: Nullish<number>; lng?: Nullish<number> }>;
  parcelId?: Nullish<Id>;
  photoUpdatedAt?: Nullish<Date>;
  createdAt: Date;
  updatedAt: Date;
}): PlantDto {
  const { location } = plant;
  return {
    id: plant._id.toString(),
    name: plant.name,
    latinName: plant.latinName ?? undefined,
    careNote: plant.careNote ?? undefined,
    location:
      location?.lat != null && location.lng != null
        ? { lat: location.lat, lng: location.lng }
        : undefined,
    parcelId: optionalId(plant.parcelId),
    photoUpdatedAt: plant.photoUpdatedAt
      ? iso(plant.photoUpdatedAt)
      : undefined,
    createdAt: iso(plant.createdAt),
    updatedAt: iso(plant.updatedAt),
  };
}

export function toParcelDto(
  parcel: {
    _id: Id;
    name: string;
    kind?: Nullish<string>;
    polygon: number[][];
    notes?: Nullish<string>;
    createdAt: Date;
    updatedAt: Date;
  },
  plantCount: number,
): ParcelDto {
  return {
    id: parcel._id.toString(),
    name: parcel.name,
    kind: parcel.kind === "garden" ? "garden" : "field",
    polygon: parcel.polygon.map(([lng, lat]) => [lng!, lat!]),
    notes: parcel.notes ?? undefined,
    plantCount,
    createdAt: iso(parcel.createdAt),
    updatedAt: iso(parcel.updatedAt),
  };
}

export function toAnalysisRecordDto(record: {
  _id: Id;
  plantId?: Nullish<Id>;
  mode: string;
  tags: string[];
  analysis?: unknown;
  assessment?: unknown;
  sources: unknown[];
  createdAt: Date;
}): AnalysisRecordDto {
  return {
    id: record._id.toString(),
    plantId: optionalId(record.plantId),
    mode: record.mode === "rag" ? "rag" : "standard",
    tags: record.tags,
    analysis: record.analysis as Record<string, unknown>,
    assessment: record.assessment as Record<string, unknown>,
    sources: record.sources as Record<string, unknown>[],
    createdAt: iso(record.createdAt),
  };
}

export function toTaskDto(task: {
  _id: Id;
  title: string;
  notes?: Nullish<string>;
  dueDate: Date;
  done: boolean;
  doneAt?: Nullish<Date>;
  repeat?: Nullish<string>;
  plantId?: Nullish<Id>;
  parcelId?: Nullish<Id>;
  createdAt: Date;
}): TaskDto {
  return {
    id: task._id.toString(),
    title: task.title,
    notes: task.notes ?? undefined,
    dueDate: iso(task.dueDate),
    done: task.done,
    doneAt: task.doneAt ? iso(task.doneAt) : undefined,
    repeat: (task.repeat ?? "none") as TaskRepeat,
    plantId: optionalId(task.plantId),
    parcelId: optionalId(task.parcelId),
    createdAt: iso(task.createdAt),
  };
}

function addInterval(date: Date, repeat: Exclude<TaskRepeat, "none">) {
  const next = new Date(date);
  if (repeat === "monthly") next.setUTCMonth(next.getUTCMonth() + 1);
  else next.setUTCDate(next.getUTCDate() + (repeat === "weekly" ? 7 : 1));
  return next;
}

// First occurrence after both the previous due date and now, so completing a
// task that is weeks overdue does not spawn a task that is overdue again.
export function nextDueDate(
  due: Date,
  repeat: Exclude<TaskRepeat, "none">,
  now = new Date(),
) {
  let next = addInterval(due, repeat);
  while (next <= now) next = addInterval(next, repeat);
  return next;
}
