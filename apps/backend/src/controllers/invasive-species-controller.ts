import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import { AppError } from "@utils/app-error.js";
import { findInvasiveSpecies } from "@services/invasive-species-service.js";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(100).default(25),
});

export async function getInvasiveSpeciesMap(req: Request, res: Response) {
  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    throw AppError.badRequest(
      query.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
    );
  }

  const { lat, lng, radiusKm } = query.data;
  const map = await findInvasiveSpecies(lat, lng, radiusKm);

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(map, "Invasive species observations loaded"));
}
