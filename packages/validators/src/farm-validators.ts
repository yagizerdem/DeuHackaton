import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "Invalid id");

const geoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// null clears an optional field on update, undefined leaves it alone
export function createPlantValidator() {
  return z.object({
    name: z.string().trim().min(1).max(80),
    latinName: z.string().trim().max(120).nullish(),
    careNote: z.string().trim().max(2000).nullish(),
    location: geoPoint.nullish(),
    parcelId: objectId.nullish(),
  });
}

export function createPlantUpdateValidator() {
  return createPlantValidator().partial();
}

export type PlantInput = z.infer<ReturnType<typeof createPlantValidator>>;
export type PlantUpdateInput = z.infer<
  ReturnType<typeof createPlantUpdateValidator>
>;

const parcelShape = {
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["field", "garden"]),
  // [lng, lat] corners, the server closes the ring
  polygon: z
    .array(
      z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    )
    .min(3)
    .max(500),
  notes: z.string().trim().max(2000).nullish(),
};

export function createParcelValidator() {
  return z.object({ ...parcelShape, kind: parcelShape.kind.default("field") });
}

// no defaults here: a default inside partial() would overwrite stored values
export function createParcelUpdateValidator() {
  return z.object(parcelShape).partial();
}

export type ParcelInput = z.infer<ReturnType<typeof createParcelValidator>>;
export type ParcelUpdateInput = z.infer<
  ReturnType<typeof createParcelUpdateValidator>
>;

export const tagsSchema = z
  .array(z.string().trim().min(1).max(30))
  .max(10)
  .transform((tags) => [...new Set(tags)]);

export function createAnalysisRecordUpdateValidator() {
  return z.object({
    tags: tagsSchema.optional(),
    plantId: objectId.nullish(),
  });
}

export type AnalysisRecordUpdateInput = z.infer<
  ReturnType<typeof createAnalysisRecordUpdateValidator>
>;

const taskShape = {
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(2000).nullish(),
  dueDate: z.iso.datetime({ offset: true }),
  repeat: z.enum(["none", "daily", "weekly", "monthly"]),
  plantId: objectId.nullish(),
  parcelId: objectId.nullish(),
};

export function createTaskValidator() {
  return z.object({ ...taskShape, repeat: taskShape.repeat.default("none") });
}

export function createTaskUpdateValidator() {
  return z
    .object(taskShape)
    .partial()
    // reopening a completed task, completing goes through POST /tasks/:id/complete
    .extend({ done: z.literal(false).optional() });
}

export type TaskInput = z.infer<ReturnType<typeof createTaskValidator>>;
export type TaskUpdateInput = z.infer<
  ReturnType<typeof createTaskUpdateValidator>
>;
