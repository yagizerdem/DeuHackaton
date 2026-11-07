import mongoose from "mongoose";

// One document per issued refresh token. `family` groups every token minted
// from the same login so a whole chain can be revoked when rotation detects reuse.
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    family: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // mongo removes the document once expiresAt has passed
      expires: 0,
    },
    revokedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const RefreshToken = mongoose.model("RefreshToken", schema);
