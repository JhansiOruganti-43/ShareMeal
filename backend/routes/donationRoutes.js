const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { addDonation } = require("../controllers/donationController");
const { updateDonation } = require("../controllers/updateDonationController");
const { deleteDonation } = require("../controllers/deleteDonationController");
const { searchDonations } = require("../controllers/searchController");
const { getMyDonations } = require("../controllers/getMyDonationsController");
const { getDonationById } = require("../controllers/getDonationByIdController");
const { restaurantDashboard,} = require("../controllers/restaurantDashboardController");

// =====================
// Add Donation
// =====================
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("restaurant"),
  upload.single("image"),
  addDonation
);

// =====================
// Search Donations
// =====================
router.get("/search", searchDonations);

// =====================
// Get My Donations
// IMPORTANT: Keep this ABOVE "/:id"
// =====================
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("restaurant"),
  getMyDonations
);

// =====================
// Get Single Donation by ID
// =====================
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  getDonationById
);

// =====================
// Update Donation
// =====================
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  updateDonation
);

// =====================
// Delete Donation
// =====================
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  deleteDonation
);

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("restaurant"),
  restaurantDashboard
);

module.exports = router;