import { readDevEnv, readProdEnv } from "@/read-env.js";
import { connectDB } from "@/db.js";
import app from "@/app.js";

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

await connectDB(mongoUri);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
