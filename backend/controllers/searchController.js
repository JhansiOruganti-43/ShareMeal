const Donation = require("../models/Donation");

const searchDonations = async (req, res) => {
  try {
    const { foodName } = req.query;

    const donations = await Donation.find({
      foodName: {
        $regex: foodName,
        $options: "i",
      },
    });

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
  searchDonations,
};