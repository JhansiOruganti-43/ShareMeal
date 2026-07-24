import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true, unique: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending_pickup", "completed", "cancelled"],
      default: "pending_pickup",
    },
    pickupTime: { type: Date, default: null },
    qrCodeHash: { type: String, default: "" },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
