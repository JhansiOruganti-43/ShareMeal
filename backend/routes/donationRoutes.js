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
const { ngoDashboard } = require("../controllers/ngoDashboardController");
const { getAvailableDonations,} = require("../controllers/getAvailableDonationsController");
const { restaurantDashboard, } = require("../controllers/restaurantDashboardController");
const { claimDonation } = require("../controllers/claimDonationController");

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
// =====================
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("restaurant"),
  getMyDonations
);

// =====================
// Restaurant Dashboard
// IMPORTANT: Keep this ABOVE "/:id"
// =====================
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("restaurant"),
  restaurantDashboard
);

// =====================
// NGO Dashboard
// =====================
router.get(
  "/ngo-dashboard",
  authMiddleware,
  roleMiddleware("ngo"),
  ngoDashboard
);
// =====================
// Get Available Donations (NGO)
// =====================
router.get(
  "/available",
  authMiddleware,
  roleMiddleware("ngo"),
  getAvailableDonations
);

// =====================
// Claim Donation (NGO)
// =====================
router.put(
  "/claim/:id",
  authMiddleware,
  roleMiddleware("ngo"),
  claimDonation
);
// =====================
// Get Single Donation By ID
// IMPORTANT: Keep this BELOW "/dashboard"
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

module.exports = router;