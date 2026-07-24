import { Router } from "express";
import {
  getPendingUsers,
  verifyUser,
  getAllUsers,
  deleteUser,
  getAllDonations,
  deleteDonation,
} from "../controllers/adminController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(protect, requireRole("admin"));

router.get("/users/pending", getPendingUsers);
router.post("/users/:id/verify", verifyUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/donations", getAllDonations);
router.delete("/donations/:id", deleteDonation);

export default router;
