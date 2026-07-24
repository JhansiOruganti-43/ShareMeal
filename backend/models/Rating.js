import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratedFor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
