import express from "express";
import mongoose from "mongoose";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const mongoUri =
  process.env.MONGODB_URI ??
  "mongodb://user:1234@127.0.0.1:27017/depark?authSource=admin";

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 });
});

await mongoose.connect(mongoUri);
console.log("MongoDB connected");

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
