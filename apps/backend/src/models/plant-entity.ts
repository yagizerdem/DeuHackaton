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
    latinName: { type: String, trim: true },
    careNote: { type: String, trim: true },
    tags: { type: [String], default: [] },
    location: {
      type: new mongoose.Schema(
        { lat: Number, lng: Number },
        { _id: false },
      ),
    },
    parcelId: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel" },
    // the photo lives in the document, select: false keeps it out of list queries
    photo: {
      type: new mongoose.Schema(
        { data: Buffer, contentType: String },
        { _id: false },
      ),
      select: false,
    },
    photoUpdatedAt: { type: Date },
  },
  { timestamps: true },
);

export const Plant = mongoose.model("Plant", schema);
