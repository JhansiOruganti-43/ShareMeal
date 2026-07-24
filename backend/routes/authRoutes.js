import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  me,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("role").notEmpty().withMessage("Role is required"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/me", protect, me);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
