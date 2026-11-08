import { Request, Response } from "express";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type { PlantDto } from "@DeparkHackaton/dto";
import type {
  PlantInput,
  PlantUpdateInput,
} from "@DeparkHackaton/validators";
import { Plant } from "@models/plant-entity.js";
import { Parcel } from "@models/parcel-entity.js";
import { Task } from "@models/task-entity.js";
import { AnalysisRecord } from "@models/analysis-record-entity.js";
import {
  applyPatch,
  ensureOwnedRef,
  ensureValidId,
  toPlantDto,
} from "@services/farm-service.js";
import { AppError } from "@utils/app-error.js";

async function findPlant(req: Request) {
  const plant = await Plant.findOne({
    _id: ensureValidId(req.params.id),
    owner: req.user!.id,
  });
  if (!plant) throw AppError.notFound("Plant not found");
  return plant;
}

export async function listPlants(req: Request, res: Response) {
  const filter: Record<string, unknown> = { owner: req.user!.id };
  if (typeof req.query.parcelId === "string") {
    filter.parcelId = ensureValidId(req.query.parcelId);
  }

  const plants = await Plant.find(filter).sort({ createdAt: -1 });

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok<PlantDto[]>(plants.map(toPlantDto)));
}

export async function getPlant(req: Request, res: Response) {
  const plant = await findPlant(req);
  return res.status(HttpStatusCode.OK).json(ApiResponse.ok(toPlantDto(plant)));
}

export async function createPlant(req: Request, res: Response) {
  const input = req.body as PlantInput;
  await ensureOwnedRef(Parcel, input.parcelId, req.user!.id, "Parcel");

  const plant = new Plant({ owner: req.user!.id });
  applyPatch(plant, input);
  await plant.save();

  return res
    .status(HttpStatusCode.CREATED)
    .json(ApiResponse.created(toPlantDto(plant), "Plant created"));
}

export async function updatePlant(req: Request, res: Response) {
  const patch = req.body as PlantUpdateInput;
  await ensureOwnedRef(Parcel, patch.parcelId, req.user!.id, "Parcel");

  const plant = await findPlant(req);
  applyPatch(plant, patch);
  await plant.save();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toPlantDto(plant), "Plant updated"));
}

export async function deletePlant(req: Request, res: Response) {
  const plant = await findPlant(req);

  // tasks of a deleted plant make no sense, the analysis records are kept
  await Promise.all([
    Task.deleteMany({ owner: req.user!.id, plantId: plant._id }),
    AnalysisRecord.updateMany(
      { owner: req.user!.id, plantId: plant._id },
      { $unset: { plantId: 1 } },
    ),
  ]);
  await plant.deleteOne();

  return res.status(HttpStatusCode.OK).json(ApiResponse.ok(null, "Plant deleted"));
}

export async function setPlantPhoto(req: Request, res: Response) {
  if (!req.file) {
    throw AppError.badRequest('Image is required in the "image" field');
  }

  const plant = await findPlant(req);
  plant.photo = { data: req.file.buffer, contentType: req.file.mimetype };
  plant.photoUpdatedAt = new Date();
  await plant.save();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toPlantDto(plant), "Photo saved"));
}

export async function getPlantPhoto(req: Request, res: Response) {
  const plant = await Plant.findOne({
    _id: ensureValidId(req.params.id),
    owner: req.user!.id,
  }).select("+photo");

  if (!plant?.photo?.data || !plant.photo.contentType) {
    throw AppError.notFound("Photo not found");
  }

  res.setHeader("Content-Type", plant.photo.contentType);
  // the web app adds ?v=<photoUpdatedAt>, so a new photo gets a new URL
  res.setHeader("Cache-Control", "private, max-age=86400");
  return res.status(HttpStatusCode.OK).send(plant.photo.data);
}

export async function deletePlantPhoto(req: Request, res: Response) {
  const plant = await findPlant(req);
  plant.photo = undefined;
  plant.photoUpdatedAt = undefined;
  await plant.save();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toPlantDto(plant), "Photo removed"));
}
