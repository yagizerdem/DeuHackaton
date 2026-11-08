import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    done: { type: Boolean, default: false },
    doneAt: { type: Date },
    repeat: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: "Plant" },
    parcelId: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel" },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", schema);
