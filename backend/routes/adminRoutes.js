const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllClaims } = require("../controllers/adminController");
const { updateClaimStatus } = require("../controllers/claimStatusController");

// View All Claims
router.get(
  "/claims",
  authMiddleware,
  roleMiddleware("admin"),
  getAllClaims
);

// Approve / Reject Claim
router.put(
  "/claims/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateClaimStatus
);

module.exports = router;