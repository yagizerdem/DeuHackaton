import { Router } from "express";
import {
  analyzeImage,
  analyzeImageWithRag,
} from "@controllers/plan-analysis-controller.js";
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
 *                 analysis:
 *                   isPlant: true
 *                   species:
 *                     commonName: Doğu çınarı
 *                     latinName: Platanus orientalis
 *                     family: Platanaceae
 *                     confidence: 0.94
 *                   symptoms:
 *                     - Yapraklarda sarı benekler ve bronzlaşma
 *                   suspectedPestsAndDiseases:
 *                     - latinName: Corythucha ciliata
 *                       commonName: Çınar ağı böceği
 *                       type: insect
 *                       reason: Yaprak alt yüzeyinde benekli kloroz
 *                   invasiveThreats:
 *                     - latinName: Anoplophora chinensis
 *                       commonName: Turunçgil uzun antenli böceği
 *                   protectiveMeasures:
 *                     - Gövde tabanında 10-15 mm çıkış deliklerini kontrol edin
 *                   summary: Yapraklarda çınar ağı böceği belirtileri var, gövde tabanını kontrol edin.
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

/**
 * @openapi
 * /api/plan-analysis/rag:
 *   post:
 *     tags:
 *       - Plan Analysis
 *     summary: Analyze a plant image with the knowledge base
 *     description: >-
 *       Same input as `/api/plan-analysis`, but the risk assessment is grounded
 *       in pages retrieved from the RAG knowledge base. The response also lists
 *       the `sources` (file, page, score) that were used.
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
 *         description: Analysis, grounded assessment and the sources used
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
 *         description: The knowledge base or Gemini is unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 */
planAnalysisRouter.post(
  "/rag",
  authenticate,
  uploadImage,
  asyncWrapper(analyzeImageWithRag),
);
