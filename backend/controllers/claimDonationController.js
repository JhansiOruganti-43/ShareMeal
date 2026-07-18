const Donation = require("../models/Donation");

const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (donation.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "Donation already claimed",
      });
    }

    donation.status = "Claimed";
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation claimed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { claimDonation };