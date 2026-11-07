import express from "express";
import { errorHandler } from "@middlewares/error-handler.js";
import { authRouter } from "@routes/auth-route.js";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "@/docs/openapi.js";
import mongoose from "mongoose";
const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;
