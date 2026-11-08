import { Router } from "express";
import {
  createParcelUpdateValidator,
  createParcelValidator,
} from "@DeparkHackaton/validators";
import {
  createParcel,
  deleteParcel,
  getParcel,
  listParcels,
  updateParcel,
} from "@controllers/parcel-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { validator } from "@/middlewares/validator.js";

export const parcelRouter = Router();

parcelRouter.use(authenticate);

/**
 * @openapi
 * /api/parcels:
 *   get:
 *     tags: [Parcels]
 *     summary: List the parcels (fields and gardens) of the current user
 *     description: Every parcel includes plantCount, the number of plants linked to it.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       "200": { description: Parcels, newest first }
 *   post:
 *     tags: [Parcels]
 *     summary: Add a parcel
 *     description: >-
 *       polygon is a list of at least 3 [lng, lat] corners as drawn on the map,
 *       the ring does not need to be closed. kind is field (default) or garden.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       "201": { description: Parcel created }
 *       "400": { description: Validation failed }
 */
parcelRouter.get("/", asyncWrapper(listParcels));
parcelRouter.post(
  "/",
  validator(createParcelValidator()),
  asyncWrapper(createParcel),
);

/**
 * @openapi
 * /api/parcels/{id}:
 *   get:
 *     tags: [Parcels]
 *     summary: Get one parcel
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: The parcel }
 *       "404": { description: Parcel not found }
 *   patch:
 *     tags: [Parcels]
 *     summary: Edit a parcel
 *     description: Send only the fields to change. Plants are linked to a parcel through PATCH /api/plants/{id}.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Parcel updated }
 *       "404": { description: Parcel not found }
 *   delete:
 *     tags: [Parcels]
 *     summary: Delete a parcel
 *     description: Its plants and tasks are kept and only lose the parcel link.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Parcel deleted }
 *       "404": { description: Parcel not found }
 */
parcelRouter.get("/:id", asyncWrapper(getParcel));
parcelRouter.patch(
  "/:id",
  validator(createParcelUpdateValidator()),
  asyncWrapper(updateParcel),
);
parcelRouter.delete("/:id", asyncWrapper(deleteParcel));
