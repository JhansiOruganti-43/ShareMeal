const Donation = require("../models/Donation");

const restaurantDashboard = async (req, res) => {
  try {
    const restaurantId = req.user.id;

    const total = await Donation.countDocuments({
      restaurant: restaurantId,
    });

    const available = await Donation.countDocuments({
      restaurant: restaurantId,
      status: "Available",
    });

    const claimed = await Donation.countDocuments({
      restaurant: restaurantId,
      status: "Claimed",
    });

    const completed = await Donation.countDocuments({
      restaurant: restaurantId,
      status: "Completed",
    });

    res.json({
      success: true,
      total,
      available,
      claimed,
      completed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { restaurantDashboard };