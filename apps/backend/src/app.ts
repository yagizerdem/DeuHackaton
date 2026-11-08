import express from "express";
import { errorHandler } from "@middlewares/error-handler.js";
import { authRouter } from "@routes/auth-route.js";
import { planAnalysisRouter } from "@routes/plan-analysis-route.js";
import swaggerUi from "swagger-ui-express";
import mongoose from "mongoose";
import { swaggerSpec } from "@/docs/swagger.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Read lazily: the env files are loaded in server.ts after the imports are evaluated.
// CORS_ORIGIN is a comma separated list of allowed origins.
const allowedOrigins = () =>
  (process.env.CORS_ORIGIN ?? "http://localhost:5000")
    .split(",")
    .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) =>
      // requests without an Origin header (curl, server to server) are not CORS requests
      callback(null, !origin || allowedOrigins().includes(origin)),
    // the auth cookies are sent cross-origin, so credentials must be allowed
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use("/api/auth", authRouter);
app.use("/api/plan-analysis", planAnalysisRouter);

app.use(errorHandler);

export default app;
