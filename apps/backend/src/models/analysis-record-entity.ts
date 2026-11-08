import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: "Plant" },
    mode: { type: String, enum: ["standard", "rag"], required: true },
    tags: { type: [String], default: [] },
    // snapshots of the /api/plan-analysis answer, validated before they are saved
    analysis: { type: mongoose.Schema.Types.Mixed, required: true },
    assessment: { type: mongoose.Schema.Types.Mixed, required: true },
    sources: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
);

export const AnalysisRecord = mongoose.model("AnalysisRecord", schema);
