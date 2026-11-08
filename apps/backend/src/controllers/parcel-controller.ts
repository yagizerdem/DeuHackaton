import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse, HttpStatusCode } from "@DeparkHackaton/shared";
import type { ParcelDto } from "@DeparkHackaton/dto";
import type {
  ParcelInput,
  ParcelUpdateInput,
} from "@DeparkHackaton/validators";
import { Parcel } from "@models/parcel-entity.js";
import { Plant } from "@models/plant-entity.js";
import { Task } from "@models/task-entity.js";
import {
  applyPatch,
  ensureValidId,
  toParcelDto,
} from "@services/farm-service.js";
import { AppError } from "@utils/app-error.js";

async function findParcel(req: Request) {
  const parcel = await Parcel.findOne({
    _id: ensureValidId(req.params.id),
    owner: req.user!.id,
  });
  if (!parcel) throw AppError.notFound("Parcel not found");
  return parcel;
}

export async function listParcels(req: Request, res: Response) {
  const owner = req.user!.id;
  const [parcels, counts] = await Promise.all([
    Parcel.find({ owner }).sort({ createdAt: -1 }),
    Plant.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(owner),
          parcelId: { $ne: null },
        },
      },
      { $group: { _id: "$parcelId", count: { $sum: 1 } } },
    ]),
  ]);

  const countById = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return res.status(HttpStatusCode.OK).json(
    ApiResponse.ok<ParcelDto[]>(
      parcels.map((parcel) =>
        toParcelDto(parcel, countById.get(parcel._id.toString()) ?? 0),
      ),
    ),
  );
}

export async function getParcel(req: Request, res: Response) {
  const parcel = await findParcel(req);
  const plantCount = await Plant.countDocuments({
    owner: req.user!.id,
    parcelId: parcel._id,
  });

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toParcelDto(parcel, plantCount)));
}

export async function createParcel(req: Request, res: Response) {
  const input = req.body as ParcelInput;

  const parcel = new Parcel({ owner: req.user!.id });
  applyPatch(parcel, input);
  await parcel.save();

  return res
    .status(HttpStatusCode.CREATED)
    .json(ApiResponse.created(toParcelDto(parcel, 0), "Parcel created"));
}

export async function updateParcel(req: Request, res: Response) {
  const parcel = await findParcel(req);
  applyPatch(parcel, req.body as ParcelUpdateInput);
  await parcel.save();

  const plantCount = await Plant.countDocuments({
    owner: req.user!.id,
    parcelId: parcel._id,
  });

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(toParcelDto(parcel, plantCount), "Parcel updated"));
}

export async function deleteParcel(req: Request, res: Response) {
  const parcel = await findParcel(req);
  const owner = req.user!.id;

  // plants and tasks stay, they just lose the link
  await Promise.all([
    Plant.updateMany({ owner, parcelId: parcel._id }, { $unset: { parcelId: 1 } }),
    Task.updateMany({ owner, parcelId: parcel._id }, { $unset: { parcelId: 1 } }),
  ]);
  await parcel.deleteOne();

  return res
    .status(HttpStatusCode.OK)
    .json(ApiResponse.ok(null, "Parcel deleted"));
}
