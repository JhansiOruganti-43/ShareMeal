import { Router } from "express";
import {
  getAvailableDonations,
  claimDonation,
  getClaimHistory,
  confirmPickup,
  ratePickup,
  updateProfile,
} from "../controllers/ngoController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(protect, requireRole("ngo"));

router.get("/donations", getAvailableDonations);
router.post("/claim", claimDonation);
router.get("/history", getClaimHistory);
router.post("/confirm-pickup", confirmPickup);
router.post("/rate", ratePickup);
router.put("/profile", updateProfile);

export default router;
