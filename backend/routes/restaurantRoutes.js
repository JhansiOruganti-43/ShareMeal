const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getRestaurantDonations,
} = require("../controllers/restaurantController");

router.get("/:restaurantId/donations", authMiddleware, getRestaurantDonations);
module.exports = router;