import { z } from "zod";
import {
  createLoginValidator,
  createRegisterValidator,
} from "@DeparkHackaton/validators";

const toSchema = (schema: z.ZodType) =>
  z.toJSONSchema(schema, { target: "openapi-3.0", io: "input" });

const apiResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiResponse" },
    },
  },
});

const jsonBody = (schemaName: string) => ({
  required: true,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaName}` },
    },
  },
});

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Depark Hackaton API",
    version: "1.0.0",
  },
  tags: [
    { name: "System", description: "Service status" },
    { name: "Auth", description: "Registration and session endpoints" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Service and database status",
        responses: {
          "200": {
            description: "Service is up",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    db: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: jsonBody("RegisterInput"),
        responses: {
          "201": apiResponse("User registered"),
          "400": apiResponse("Validation failed"),
          "409": apiResponse("Email already exists"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email and password",
        requestBody: jsonBody("LoginInput"),
        responses: {
          "200": apiResponse("Logged in"),
          "400": apiResponse("Validation failed"),
          "401": apiResponse("Invalid credentials"),
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out the current user",
        responses: {
          "200": apiResponse("Logged out"),
        },
      },
    },
  },
  components: {
    schemas: {
      RegisterInput: toSchema(createRegisterValidator()),
      LoginInput: toSchema(createLoginValidator()),
      ApiResponse: {
        type: "object",
        properties: {
          httpStatusCode: { type: "integer", example: 200 },
          message: { type: "string" },
          formErrors: {
            type: "object",
            additionalProperties: { type: "array", items: { type: "string" } },
          },
          data: {},
        },
        required: ["httpStatusCode", "message"],
      },
    },
  },
};
