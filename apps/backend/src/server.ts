import express from "express";
import mongoose from "mongoose";
import { readDevEnv } from "@/read-env.js";
import { connectDB } from "@/db.js";

if (process.env.NODE_ENV === "development") {
  readDevEnv();
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

await connectDB(mongoUri);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
