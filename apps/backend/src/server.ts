import express from "express";
import mongoose from "mongoose";
import { readDevEnv, readProdEnv } from "@/read-env.js";
import { connectDB } from "@/db.js";
import { errorHandler } from "@middlewares/error-handler.js";
import { authRouter } from "@routes/auth-route.js";

if (process.env.NODE_ENV === "development") {
  readDevEnv();
}

if (process.env.NODE_ENV === "production") {
  readProdEnv();
}

const mongoUri =
  process.env.MONGODB_URI ??
  (() => {
    throw new Error("MONGODB_URI is not defined");
  })();

const port = process.env.PORT
  ? Number(process.env.PORT)
  : (() => {
      throw new Error("PORT is not defined");
    })();

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);

app.use(errorHandler);

await connectDB(mongoUri);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
