const Donation = require("../models/Donation");

const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation updated successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateDonation,
};