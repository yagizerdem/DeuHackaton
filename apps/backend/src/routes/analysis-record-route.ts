import { Router } from "express";
import { createAnalysisRecordUpdateValidator } from "@DeparkHackaton/validators";
import {
  createAnalysisRecord,
  createAnalysisRecordValidator,
  deleteAnalysisRecord,
  getAnalysisRecord,
  listAnalysisRecords,
  updateAnalysisRecord,
} from "@controllers/analysis-record-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { validator } from "@/middlewares/validator.js";

export const analysisRecordRouter = Router();

analysisRecordRouter.use(authenticate);

/**
 * @openapi
 * /api/analysis-records:
 *   get:
 *     tags: [Analysis Records]
 *     summary: List the saved analyses of the current user
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: plantId, schema: { type: string }, description: Only records linked to this plant. }
 *       - { in: query, name: tag, schema: { type: string }, description: Only records with this tag. }
 *     responses:
 *       "200": { description: Up to 200 records, newest first }
 *   post:
 *     tags: [Analysis Records]
 *     summary: Save an analysis as a record
 *     description: >-
 *       Send the `analysis` and `assessment` (and `sources` for mode rag)
 *       exactly as POST /api/plan-analysis answered, plus `mode`
 *       (standard or rag). plantId links the record to a plant, tags labels it.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       "201": { description: Record saved }
 *       "400": { description: Validation failed }
 *       "404": { description: Plant not found }
 */
analysisRecordRouter.get("/", asyncWrapper(listAnalysisRecords));
analysisRecordRouter.post(
  "/",
  validator(createAnalysisRecordValidator()),
  asyncWrapper(createAnalysisRecord),
);

/**
 * @openapi
 * /api/analysis-records/{id}:
 *   get:
 *     tags: [Analysis Records]
 *     summary: Get one record
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: The record }
 *       "404": { description: Record not found }
 *   patch:
 *     tags: [Analysis Records]
 *     summary: Edit the tags or the linked plant of a record
 *     description: The diagnosis itself is a snapshot and cannot be edited. plantId null unlinks the plant.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Record updated }
 *       "404": { description: Record or plant not found }
 *   delete:
 *     tags: [Analysis Records]
 *     summary: Delete a record
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Record deleted }
 *       "404": { description: Record not found }
 */
analysisRecordRouter.get("/:id", asyncWrapper(getAnalysisRecord));
analysisRecordRouter.patch(
  "/:id",
  validator(createAnalysisRecordUpdateValidator()),
  asyncWrapper(updateAnalysisRecord),
);
analysisRecordRouter.delete("/:id", asyncWrapper(deleteAnalysisRecord));
