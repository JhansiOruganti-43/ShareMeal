const Donation = require("../models/Donation");

const getRestaurantDonations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const donations = await Donation.find({ restaurant: restaurantId });

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
  getRestaurantDonations,
};