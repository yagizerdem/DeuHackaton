import { Router } from "express";
import {
  createTaskUpdateValidator,
  createTaskValidator,
} from "@DeparkHackaton/validators";
import {
  completeTask,
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "@controllers/task-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { authenticate } from "@/middlewares/authenticate.js";
import { validator } from "@/middlewares/validator.js";

export const taskRouter = Router();

taskRouter.use(authenticate);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List the tasks of the current user
 *     description: Open tasks come first, ordered by due date, then the finished ones.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: done, schema: { type: boolean } }
 *       - { in: query, name: plantId, schema: { type: string } }
 *       - { in: query, name: parcelId, schema: { type: string } }
 *     responses:
 *       "200": { description: Tasks }
 *   post:
 *     tags: [Tasks]
 *     summary: Add a task
 *     description: >-
 *       dueDate is an ISO 8601 date-time. repeat is none (default), daily,
 *       weekly or monthly. plantId and parcelId are optional links.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     responses:
 *       "201": { description: Task created }
 *       "400": { description: Validation failed }
 *       "404": { description: Plant or parcel not found }
 */
taskRouter.get("/", asyncWrapper(listTasks));
taskRouter.post("/", validator(createTaskValidator()), asyncWrapper(createTask));

/**
 * @openapi
 * /api/tasks/{id}/complete:
 *   post:
 *     tags: [Tasks]
 *     summary: Mark a task as done
 *     description: >-
 *       A repeating task also gets its next occurrence, returned as `next`.
 *       Completing a finished task changes nothing.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: "{ task, next }" }
 *       "404": { description: Task not found }
 */
taskRouter.post("/:id/complete", asyncWrapper(completeTask));

/**
 * @openapi
 * /api/tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Edit a task or reopen it
 *     description: >-
 *       Send only the fields to change. Sending done false reopens a finished
 *       task.
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Task updated }
 *       "404": { description: Task, plant or parcel not found }
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security: [{ bearerAuth: [] }, { cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       "200": { description: Task deleted }
 *       "404": { description: Task not found }
 */
taskRouter.patch(
  "/:id",
  validator(createTaskUpdateValidator()),
  asyncWrapper(updateTask),
);
taskRouter.delete("/:id", asyncWrapper(deleteTask));
