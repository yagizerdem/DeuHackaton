import { Router } from "express";
import { getInvasiveSpeciesMap } from "@controllers/invasive-species-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";

export const invasiveSpeciesRouter = Router();

/**
 * @openapi
 * /api/invasive-species:
 *   get:
 *     tags:
 *       - Invasive Species
 *     summary: Invasive species observations around a point
 *     description: >-
 *       Returns GBIF observations (since 1990) of a fixed list of invasive plant
 *       pests and weeds inside the radius, nearest first, with a per species
 *       count and the nearest observation. Observations without a year or with
 *       a coordinate precision worse than 5 km are left out. At most 900
 *       observations are returned, `truncated` tells when there were more.
 *       Results are cached for an hour. Requires a valid access token.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number, minimum: -90, maximum: 90 }
 *         example: 41.0082
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number, minimum: -180, maximum: 180 }
 *         example: 28.9784
 *       - in: query
 *         name: radiusKm
 *         schema: { type: number, minimum: 1, maximum: 100, default: 25 }
 *     responses:
 *       "200": { description: Observations around the point }
 *       "400": { description: Invalid query }
 *       "401": { description: Authentication required }
 *       "503": { description: GBIF is unreachable }
 */
invasiveSpeciesRouter.get("/", authenticate, asyncWrapper(getInvasiveSpeciesMap));
