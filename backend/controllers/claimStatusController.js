const Claim = require("../models/Claim");

const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const claim = await Claim.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Claim status updated successfully",
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
  updateClaimStatus,
};