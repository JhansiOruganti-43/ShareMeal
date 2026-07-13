const Claim = require("../models/Claim");

const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("donation")
      .populate("ngo", "name email role");

    res.status(200).json({
      success: true,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllClaims,
};