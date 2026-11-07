import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";
import { z } from "zod";
import {
  createLoginValidator,
  createRegisterValidator,
} from "@DeparkHackaton/validators";

const toSchema = (schema: z.ZodType) =>
  z.toJSONSchema(schema, { target: "openapi-3.0", io: "input" });

// Endpoints are described with @openapi JSDoc blocks next to their routes.
// The glob resolves to .ts under tsx and to .js in the compiled output.
const routesGlob = path
  .resolve(import.meta.dirname, "../routes/*.{ts,js}")
  .replaceAll("\\", "/");

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Depark Hackaton API", version: "1.0.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        cookieAuth: { type: "apiKey", in: "cookie", name: "accessToken" },
      },
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
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
            },
            data: {},
          },
          required: ["httpStatusCode", "message"],
        },
      },
    },
  },
  apis: [routesGlob],
});
