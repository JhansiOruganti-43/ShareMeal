const Donation = require("../models/Donation");

const getMyClaimedDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      claimedBy: req.user.id,
    }).populate("restaurant", "name email");

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

module.exports = { getMyClaimedDonations };