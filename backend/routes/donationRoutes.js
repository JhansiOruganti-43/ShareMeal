const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { addDonation } = require("../controllers/donationController");
const { updateDonation } = require("../controllers/updateDonationController");
const { deleteDonation } = require("../controllers/deleteDonationController");
const { searchDonations } = require("../controllers/searchController");

// Add Donation
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("restaurant"),
  upload.single("image"),
  addDonation
);

// Search Donations
router.get("/search", searchDonations);

// Update Donation
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  updateDonation
);

// Delete Donation
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  deleteDonation
);

module.exports = router;