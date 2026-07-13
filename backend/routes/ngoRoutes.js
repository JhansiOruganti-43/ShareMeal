const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { claimDonation } = require("../controllers/ngoController");
const { getMyClaims } = require("../controllers/ngoClaimController");

// Claim Donation
router.post(
  "/claim",
  authMiddleware,
  roleMiddleware("ngo"),
  claimDonation
);

// View My Claims
router.get(
  "/claims/:ngoId",
  authMiddleware,
  roleMiddleware("ngo"),
  getMyClaims
);

module.exports = router;