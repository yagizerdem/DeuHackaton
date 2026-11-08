import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";
import { analyzeVegetation as analyze } from "@services/vegetation-service.js";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(5).default(1),
});

export async function analyzeVegetation(req: Request, res: Response) {
  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    throw AppError.badRequest(
      query.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
    );
  }

  const { lat, lon, radiusKm } = query.data;
  const analysis = await analyze(lat, lon, radiusKm);

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(analysis, "Vegetation analyzed"));
}
