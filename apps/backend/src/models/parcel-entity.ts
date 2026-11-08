import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["field", "garden"], default: "field" },
    // corners as [lng, lat], the ring is not closed. Mixed because mongoose
    // reads a nested number array as sub documents. The shape is checked by zod.
    polygon: { type: [mongoose.Schema.Types.Mixed], required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Parcel = mongoose.model("Parcel", schema);
