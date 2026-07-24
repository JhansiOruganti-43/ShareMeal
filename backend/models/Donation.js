import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    foodType: { type: String, enum: ["veg", "non-veg", "vegan"], required: true },
    quantity: { type: Number, required: true },   // servings
    weightKg: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "claimed", "completed", "expired"],
      default: "available",
    },
    expiryTime: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    co2Saved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
