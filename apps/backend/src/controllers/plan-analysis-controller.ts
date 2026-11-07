import { Request, Response } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";
import {
  analyzePlantImage,
  assessPlantRisk,
  buildRetrievalQuery,
  queryRag,
} from "@services/plant-analysis-service.js";

// Formats Gemini accepts for image input.
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function analyzeImage(req: Request, res: Response) {
  if (!req.file) {
    throw AppError.badRequest('Image is required in the "image" field');
  }

  const analysis = await analyzePlantImage(req.file.buffer, req.file.mimetype);

  const assessment = await assessPlantRisk(analysis);

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok({ analysis, assessment }, "Image analyzed"));
}

// Same as analyzeImage, but the risk assessment is grounded in knowledge base pages.
export async function analyzeImageWithRag(req: Request, res: Response) {
  if (!req.file) {
    throw AppError.badRequest('Image is required in the "image" field');
  }

  const analysis = await analyzePlantImage(req.file.buffer, req.file.mimetype);

  // nothing to look up when the image is not a plant
  const sources = analysis.isPlant
    ? await queryRag(buildRetrievalQuery(analysis))
    : [];

  const assessment = await assessPlantRisk(analysis, sources);

  // the retrieved pages only ground the assessment, they are not part of the response
  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok({ analysis, assessment }, "Image analyzed"));
}
