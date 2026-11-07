import dotenv from "dotenv";
import path from "path";

export function readDevEnv() {
  dotenv.config({ path: path.resolve(import.meta.dirname, ".env.dev") });
}
