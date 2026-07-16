const Donation = require("../models/Donation");

// Add Donation
const addDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      restaurant: req.user.id,
      ...req.body,
      image: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      success: true,
      message: "Donation added successfully",
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
  addDonation,
};