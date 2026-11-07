import { Request, Response } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";
import { analyzePlantImage } from "@services/plant-analysis-service.js";

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

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(analysis, "Image analyzed"));
}
