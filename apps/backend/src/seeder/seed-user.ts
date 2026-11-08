// Sets the password of every user in the development database to SEED_PASSWORD
// (the same password the seeder gives its fake users), so any account can log in.
//
//   cd apps/backend
//   npx tsx src/seeder/seed-user.ts
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { readDevEnv } from "@/read-env.js";
import { connectDB } from "@/db.js";
import { User } from "@models/user-entity.js";
import { SEED_PASSWORD } from "./seeder.js";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("the seeder refuses to run with NODE_ENV=production");
  }
  readDevEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  await connectDB(uri);
  try {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const { modifiedCount } = await User.updateMany({}, { passwordHash });
    console.log(`set the password of ${modifiedCount} users to ${SEED_PASSWORD}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
