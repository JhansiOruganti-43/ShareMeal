const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },
    image: {
        type: String,
        default: null,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    pickupAddress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Claimed", "Completed"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);