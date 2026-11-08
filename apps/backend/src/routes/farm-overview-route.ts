import { Router } from "express";
import {
  createPlantTagsValidator,
  createTaskStatusValidator,
  listBoard,
  listPlantOverview,
  moveTask,
  tagPlants,
} from "@controllers/farm-overview-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { validator } from "@/middlewares/validator.js";

export const farmOverviewRouter = Router();

farmOverviewRouter.use(authenticate);

/**
 * @openapi
 * /api/farm/plants:
 *   get:
 *     tags:
 *       - Farm overview
 *     summary: Plants with health status, tags and open task counts
 *     description: >-
 *       `status` comes from the severity of the latest analysis record of the
 *       plant (none: healthy, low: watching, medium or high: treating,
 *       critical: critical, no record: unknown).
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       "200":
 *         description: The plants of the user, most recently updated first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *       "401":
 *         description: Missing, invalid or expired access token
 */
farmOverviewRouter.get("/plants", asyncWrapper(listPlantOverview));

/**
 * @openapi
 * /api/farm/plants/tags:
 *   patch:
 *     tags:
 *       - Farm overview
 *     summary: Add or remove tags on several plants
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 maxItems: 200
 *                 items:
 *                   type: string
 *               add:
 *                 type: array
 *                 items:
 *                   type: string
 *               remove:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       "200":
 *         description: Tags updated
 *       "404":
 *         description: A plant was not found
 *       "422":
 *         description: A plant would get more than 10 tags
 */
farmOverviewRouter.patch(
  "/plants/tags",
  validator(createPlantTagsValidator()),
  asyncWrapper(tagPlants),
);

/**
 * @openapi
 * /api/farm/board:
 *   get:
 *     tags:
 *       - Farm overview
 *     summary: Tasks with their board column
 *     description: Each task has a `status` of todo, doing or done.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       "200":
 *         description: The tasks of the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 */
farmOverviewRouter.get("/board", asyncWrapper(listBoard));

/**
 * @openapi
 * /api/farm/tasks/{id}/status:
 *   patch:
 *     tags:
 *       - Farm overview
 *     summary: Move a task to another board column
 *     description: >-
 *       Moving to `done` completes the task like `POST /api/tasks/{id}/complete`
 *       (a repeating task gets its next occurrence) and answers with that shape.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, doing, done]
 *     responses:
 *       "200":
 *         description: Task moved
 *       "404":
 *         description: Task not found
 */
farmOverviewRouter.patch(
  "/tasks/:id/status",
  validator(createTaskStatusValidator()),
  asyncWrapper(moveTask),
);
