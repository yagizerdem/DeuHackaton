import { Router } from "express";
import { login, logout, register } from "@controllers/auth-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { validator } from "@/middlewares/validator.js";
import { createRegisterValidator } from "@DeparkHackaton/validators";

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Validates the body with the shared register schema and creates a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterInput"
 *           example:
 *             email: yagiz@example.com
 *             password: StrongPass123
 *             userName: yagiz
 *             gender: male
 *             age: 25
 *     responses:
 *       "201":
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 201
 *               message: User registered
 *       "400":
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 400
 *               message: Validation failed
 *               formErrors:
 *                 password:
 *                   - "Too small: expected string to have >=8 characters"
 *       "409":
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 */
authRouter.post(
  "/register",
  validator(createRegisterValidator()),
  asyncWrapper(register),
);

authRouter.post("/login", asyncWrapper(login));

authRouter.post("/logout", asyncWrapper(logout));
