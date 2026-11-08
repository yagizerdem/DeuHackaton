import { Router } from "express";
import {
  createPlantUpdateValidator,
  createPlantValidator,
} from "@DeparkHackaton/validators";
import {
  createPlant,
  deletePlant,
  deletePlantPhoto,
  getPlant,
  getPlantPhoto,
  listPlants,
  setPlantPhoto,
  updatePlant,
} from "@controllers/plant-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { uploadImage } from "@/middlewares/upload-image.js";
import { validator } from "@/middlewares/validator.js";

export const plantRouter = Router();

// every plant belongs to one user, all routes need a valid access token
plantRouter.use(authenticate);

/**
 * @openapi
 * /api/plants:
 *   get:
 *     tags: [Plants]
 *     summary: List the plants of the current user
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: parcelId
 *         schema: { type: string }
 *         description: Only plants linked to this parcel.
 *     responses:
 *       "200": { description: Plants, newest first }
 *   post:
 *     tags: [Plants]
 *     summary: Add a plant
 *     description: name is required. latinName, careNote, location ({ lat, lng }) and parcelId are optional.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       "201": { description: Plant created }
 *       "400": { description: Validation failed }
 *       "404": { description: Parcel not found }
 */
plantRouter.get("/", asyncWrapper(listPlants));
plantRouter.post(
  "/",
  validator(createPlantValidator()),
  asyncWrapper(createPlant),
);

/**
 * @openapi
 * /api/plants/{id}:
 *   get:
 *     tags: [Plants]
 *     summary: Get one plant
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: The plant }
 *       "404": { description: Plant not found }
 *   patch:
 *     tags: [Plants]
 *     summary: Edit a plant
 *     description: Send only the fields to change. null clears latinName, careNote, location or parcelId.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Plant updated }
 *       "404": { description: Plant or parcel not found }
 *   delete:
 *     tags: [Plants]
 *     summary: Delete a plant
 *     description: Its tasks are deleted too. Its analysis records are kept without the plant link.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Plant deleted }
 *       "404": { description: Plant not found }
 */
plantRouter.get("/:id", asyncWrapper(getPlant));
plantRouter.patch(
  "/:id",
  validator(createPlantUpdateValidator()),
  asyncWrapper(updatePlant),
);
plantRouter.delete("/:id", asyncWrapper(deletePlant));

/**
 * @openapi
 * /api/plants/{id}/photo:
 *   get:
 *     tags: [Plants]
 *     summary: Download the photo of a plant
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: The image }
 *       "404": { description: Plant or photo not found }
 *   put:
 *     tags: [Plants]
 *     summary: Upload or replace the photo of a plant
 *     description: multipart/form-data with one image in the `image` field.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       "200": { description: Photo saved }
 *       "400": { description: Image missing }
 *       "413": { description: Image too large }
 *       "415": { description: Unsupported image type }
 *   delete:
 *     tags: [Plants]
 *     summary: Remove the photo of a plant
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Photo removed }
 */
plantRouter.get("/:id/photo", asyncWrapper(getPlantPhoto));
plantRouter.put("/:id/photo", uploadImage, asyncWrapper(setPlantPhoto));
plantRouter.delete("/:id/photo", asyncWrapper(deletePlantPhoto));
