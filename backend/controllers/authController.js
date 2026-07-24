import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, role, name, phone, address, latitude, longitude,
      license_number, registration_number, description } = req.body;

    if (!["restaurant", "ngo"].includes(role)) {
      return res.status(400).json({ message: "Invalid role or role not allowed from frontend" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    let restaurantProfile = null;
    let ngoProfile = null;

    if (role === "restaurant") {
      if (!license_number) return res.status(400).json({ message: "License number required for restaurants" });
      restaurantProfile = { licenseNumber: license_number, description: description || "" };
    } else if (role === "ngo") {
      if (!registration_number) return res.status(400).json({ message: "Registration number required for NGOs" });
      ngoProfile = { registrationNumber: registration_number, description: description || "" };
    }

    const user = await User.create({
      email,
      passwordHash: password,  // pre-save hook will hash this
      role,
      name,
      phone,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      restaurantProfile,
      ngoProfile,
    });

    res.status(201).json({
      message: "Registration successful. Awaiting admin approval.",
      user: user.toPublic(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "pending" && user.role !== "admin") {
      return res.status(403).json({ message: "Your account is pending verification by administration." });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your account verification request was rejected. Contact admin." });
    }

    res.json({ token: generateToken(user._id), user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  res.json(req.user.toPublic());
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If this email is registered, we have sent an OTP." });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    await PasswordResetOTP.deleteMany({ email });
    await PasswordResetOTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Attempt email send
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_USE_TLS === "false",
        auth: { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD },
      });
      await transporter.sendMail({
        from: process.env.MAIL_DEFAULT_SENDER,
        to: email,
        subject: "ShareMeal – Password Reset OTP",
        text: `Your OTP is: ${otp}\nValid for 10 minutes.`,
      });
    } catch (mailErr) {
      console.warn("Email send failed, printing OTP to console.");
    }

    console.log(`DEBUG: OTP for ${email} → ${otp}`);
    res.json({ message: "If this email is registered, we have sent an OTP." });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = await PasswordResetOTP.findOne({ email, otp });
    if (!record || !record.isValid()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const record = await PasswordResetOTP.findOne({ email, otp });
    if (!record || !record.isValid()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.passwordHash = new_password; // pre-save hook will re-hash
    await user.save();
    await PasswordResetOTP.deleteMany({ email });

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    next(err);
  }
};
