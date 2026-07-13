const Claim = require("../models/Claim");

const getMyClaims = async (req, res) => {
  try {
    const { ngoId } = req.params;

    const claims = await Claim.find({ ngo: ngoId })
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
  getMyClaims,
};