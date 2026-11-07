import { Router } from "express";
import { login, logout, refresh, register } from "@controllers/auth-controller.js";
import asyncWrapper from "@/utils/async-wrapper.js";
import { validator } from "@/middlewares/validator.js";
import {
  createLoginValidator,
  createRegisterValidator,
} from "@DeparkHackaton/validators";

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

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in with email and password
 *     description: >-
 *       Validates the credentials and returns a short-lived access token and a
 *       long-lived refresh token. The refresh token is also stored in the
 *       database so it can be rotated and revoked.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginInput"
 *           example:
 *             email: yagiz@example.com
 *             password: StrongPass123
 *     responses:
 *       "200":
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 200
 *               message: Logged in successfully
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-payload.signature
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-payload.signature
 *                 user:
 *                   id: 665f1c2e8b3a4d0012a4c9e1
 *                   email: yagiz@example.com
 *                   userName: yagiz
 *                   gender: male
 *                   age: 25
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
 *                 email:
 *                   - "Invalid email address"
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 401
 *               message: Invalid email or password
 */
authRouter.post(
  "/login",
  validator(createLoginValidator()),
  asyncWrapper(login),
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log out the current user
 *     description: >-
 *       Clears the `accessToken` and `refreshToken` cookies. No request body
 *       is needed.
 *     responses:
 *       "200":
 *         description: Logged out
 *         headers:
 *           Set-Cookie:
 *             description: Expires the accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 200
 *               message: Logged out successfully
 */
authRouter.post("/logout", asyncWrapper(logout));

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Rotate the refresh token and get a new access token
 *     description: >-
 *       Reads the refresh token from the `refreshToken` cookie (or from the
 *       `refreshToken` field of the body). The presented token is revoked and
 *       a new access and refresh token are issued and set as cookies. Reusing a
 *       token that was already rotated revokes the whole token family.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Tokens refreshed
 *         headers:
 *           Set-Cookie:
 *             description: Sets the new accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 200
 *               message: Tokens refreshed
 *               data:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-payload.signature
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-payload.signature
 *       "401":
 *         description: Refresh token is missing, invalid, expired or already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 *             example:
 *               httpStatusCode: 401
 *               message: Refresh token has been revoked
 */
authRouter.post("/refresh", asyncWrapper(refresh));
