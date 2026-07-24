import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const restaurantProfileSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  description: { type: String, default: "" },
  bannerImage: { type: String, default: "" },
  rating: { type: Number, default: 5.0 },
  badgePoints: { type: Number, default: 0 },
});

const ngoProfileSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true },
  description: { type: String, default: "" },
  logoImage: { type: String, default: "" },
  rating: { type: Number, default: 5.0 },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "restaurant", "ngo"], required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    restaurantProfile: { type: restaurantProfileSchema, default: null },
    ngoProfile: { type: ngoProfileSchema, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.methods.toPublic = function () {
  const profile =
    this.role === "restaurant"
      ? this.restaurantProfile?.toObject()
      : this.role === "ngo"
      ? this.ngoProfile?.toObject()
      : null;

  return {
    id: this._id,
    email: this.email,
    role: this.role,
    name: this.name,
    phone: this.phone,
    address: this.address,
    latitude: this.latitude,
    longitude: this.longitude,
    status: this.status,
    created_at: this.createdAt,
    profile,
  };
};

const User = mongoose.model("User", userSchema);
export default User;
