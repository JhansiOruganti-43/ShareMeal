import mongoose from "mongoose";

const passwordResetOTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordResetOTPSchema.methods.isValid = function () {
  return new Date() <= this.expiresAt;
};

const PasswordResetOTP = mongoose.model("PasswordResetOTP", passwordResetOTPSchema);
export default PasswordResetOTP;
