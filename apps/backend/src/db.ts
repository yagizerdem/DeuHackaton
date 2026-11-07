import mongoose from "mongoose";

export async function connectDB(uri: string) {
  await mongoose.connect(uri);
  console.log("MongoDB connected");
  return mongoose.connection;
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
