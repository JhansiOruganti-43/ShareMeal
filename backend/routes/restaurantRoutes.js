import { Router } from "express";
import { body } from "express-validator";
import {
  addDonation,
  getDonations,
  updateDonation,
  deleteDonation,
  updateProfile,
  getAIRecommendations,
} from "../controllers/restaurantController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(protect, requireRole("restaurant"));

router
  .route("/donations")
  .get(getDonations)
  .post(
    [
      body("title").notEmpty().withMessage("Title is required"),
      body("food_type").notEmpty().withMessage("Food type is required"),
      body("quantity").isNumeric().withMessage("Quantity must be a number"),
      body("weight_kg").isNumeric().withMessage("Weight (kg) must be a number"),
      body("expiry_time").notEmpty().withMessage("Expiry time is required"),
    ],
    addDonation
  );

router.route("/donations/:id").put(updateDonation).delete(deleteDonation);
router.put("/profile", updateProfile);
router.get("/ai-recommend/:id", getAIRecommendations);

export default router;
