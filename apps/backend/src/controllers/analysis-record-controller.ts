import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type { AnalysisRecordDto } from "@DeparkHackaton/dto";
import {
  tagsSchema,
  type AnalysisRecordUpdateInput,
} from "@DeparkHackaton/validators";
import { AnalysisRecord } from "@models/analysis-record-entity.js";
import { Plant } from "@models/plant-entity.js";
import {
  plantAnalysisSchema,
  plantRiskAssessmentSchema,
} from "@services/plant-analysis-service.js";
import {
  applyPatch,
  ensureOwnedRef,
  ensureValidId,
  toAnalysisRecordDto,
} from "@services/farm-service.js";
import { AppError } from "@utils/app-error.js";

const MAX_RECORDS = 200;

// Same shapes the analysis endpoints return, so a record can only hold a real result.
export function createAnalysisRecordValidator() {
  return z.object({
    mode: z.enum(["standard", "rag"]),
    plantId: z
      .string()
      .regex(/^[0-9a-f]{24}$/i, "Invalid id")
      .nullish(),
    tags: tagsSchema.optional(),
    analysis: plantAnalysisSchema,
    assessment: plantRiskAssessmentSchema,
    sources: z
      .array(
        z.object({
          source: z.string(),
          page: z.number(),
          score: z.number(),
          summary: z.string(),
        }),
      )
      .max(20)
      .default([]),
  });
}

type CreateInput = z.infer<ReturnType<typeof createAnalysisRecordValidator>>;

async function findRecord(req: Request) {
  const record = await AnalysisRecord.findOne({
    _id: ensureValidId(req.params.id),
    owner: req.user!.id,
  });
  if (!record) throw AppError.notFound("Record not found");
  return record;
}

export async function listAnalysisRecords(req: Request, res: Response) {
  const filter: Record<string, unknown> = { owner: req.user!.id };
  const { plantId, tag } = req.query;
  if (typeof plantId === "string") filter.plantId = ensureValidId(plantId);
  if (typeof tag === "string") filter.tags = tag;

  const records = await AnalysisRecord.find(filter)
    .sort({ createdAt: -1 })
    .limit(MAX_RECORDS);

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok<AnalysisRecordDto[]>(records.map(toAnalysisRecordDto)));
}

export async function getAnalysisRecord(req: Request, res: Response) {
  const record = await findRecord(req);
  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toAnalysisRecordDto(record)));
}

export async function createAnalysisRecord(req: Request, res: Response) {
  const input = req.body as CreateInput;
  await ensureOwnedRef(Plant, input.plantId, req.user!.id, "Plant");

  const record = new AnalysisRecord({ owner: req.user!.id });
  applyPatch(record, input);
  await record.save();

  return res
    .status(HttpStatusCode.CREATED)
    .json(ApiResponse.created(toAnalysisRecordDto(record), "Record saved"));
}

// tags and the linked plant are the only editable parts, the diagnosis is a snapshot
export async function updateAnalysisRecord(req: Request, res: Response) {
  const patch = req.body as AnalysisRecordUpdateInput;
  await ensureOwnedRef(Plant, patch.plantId, req.user!.id, "Plant");

  const record = await findRecord(req);
  applyPatch(record, patch);
  await record.save();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toAnalysisRecordDto(record), "Record updated"));
}

export async function deleteAnalysisRecord(req: Request, res: Response) {
  const record = await findRecord(req);
  await record.deleteOne();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(null, "Record deleted"));
}
