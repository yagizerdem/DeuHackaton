import { Router } from "express";
import { analyzeImage } from "@controllers/plan-analysis-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { uploadImage } from "@/middlewares/upload-image.js";

export const planAnalysisRouter = Router();

/**
 * @openapi
 * /api/plan-analysis:
 *   post:
 *     tags:
 *       - Plan Analysis
 *     summary: Analyze a plant image
 *     description: >-
 *       Takes only the image, sent as multipart/form-data in the `image`
 *       field (jpeg, png, webp, heic, heif), max 10 MB. Requires a valid
 *       access token.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       "200":
 *         description: Analysis text from Gemini
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 200
 *               message: OK
 *               data:
 *                 text: "..."
 *       "401":
 *         description: Missing, invalid or expired access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 401
 *               message: Authentication required
 *       "413":
 *         description: Image is larger than 10 MB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *       "415":
 *         description: Unsupported image type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 */
// authenticate runs first so unauthenticated clients never get their body parsed
planAnalysisRouter.post(
  "/",
  authenticate,
  uploadImage,
  asyncWrapper(analyzeImage),
);
