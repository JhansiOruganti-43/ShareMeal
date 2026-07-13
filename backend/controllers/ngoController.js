const Claim = require("../models/Claim");

const claimDonation = async (req, res) => {
  try {
    const claim = await Claim.create(req.body);

    res.status(201).json({
      success: true,
      message: "Donation claimed successfully",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  claimDonation,
};