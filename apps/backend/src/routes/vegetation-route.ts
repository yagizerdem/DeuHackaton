import { Router } from "express";
import { analyzeVegetation } from "@controllers/vegetation-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";

export const vegetationRouter = Router();

/**
 * @openapi
 * /api/vegetation:
 *   get:
 *     tags:
 *       - Vegetation
 *     summary: Analyze the vegetation cover around a point
 *     description: >-
 *       Combines CORINE Land Cover (2018) composition inside the radius, plant
 *       observations from GBIF, elevation and last year's climate (Open-Meteo).
 *       Land cover covers Europe including Türkiye. Sources that cannot be
 *       reached are listed in `unavailable` and the rest of the answer is still
 *       returned. Requires a valid access token.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         example: 38.42
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         example: 27.14
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *           minimum: 0.1
 *           maximum: 5
 *           default: 1
 *     responses:
 *       "200":
 *         description: Vegetation analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *       "400":
 *         description: Invalid coordinates or radius
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *       "401":
 *         description: Missing, invalid or expired access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *       "503":
 *         description: Every data source is unreachable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 */
vegetationRouter.get("/", authenticate, asyncWrapper(analyzeVegetation));
