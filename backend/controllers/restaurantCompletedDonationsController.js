const Donation = require("../models/Donation");

const getRestaurantCompletedDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      restaurant: req.user.id,
      status: "Completed",
    }).populate("claimedBy", "name email");

    res.status(200).json({
      success: true,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRestaurantCompletedDonations,
};