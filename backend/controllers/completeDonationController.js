const Donation = require("../models/Donation");

const completeDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (donation.status !== "Claimed") {
      return res.status(400).json({
        success: false,
        message: "Only claimed donations can be completed",
      });
    }

    donation.status = "Completed";
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation marked as completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { completeDonation };