const Donation = require("../models/Donation");

const ngoDashboard = async (req, res) => {
  try {
    const available = await Donation.countDocuments({
      status: "Available",
    });

    const claimed = await Donation.countDocuments({
      status: "Claimed",
    });

    const completed = await Donation.countDocuments({
      status: "Completed",
    });

    res.json({
      success: true,
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

module.exports = { ngoDashboard };