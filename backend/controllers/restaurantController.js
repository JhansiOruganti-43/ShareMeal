import { validationResult } from "express-validator";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { calculateCO2Saved, suggestNearestNGOs } from "../utils/helpers.js";

// POST /api/restaurant/donations
export const addDonation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { title, description, food_type, quantity, weight_kg, expiry_time, image_url } = req.body;

    const co2Saved = calculateCO2Saved(parseFloat(weight_kg));

    const donation = await Donation.create({
      restaurantId: req.user._id,
      title,
      description: description || "",
      foodType: food_type,
      quantity: parseFloat(quantity),
      weightKg: parseFloat(weight_kg),
      expiryTime: new Date(expiry_time),
      imageUrl: image_url || "",
      co2Saved,
    });

    // Award badge points
    const restaurant = await User.findById(req.user._id);
    if (restaurant?.restaurantProfile) {
      restaurant.restaurantProfile.badgePoints += 10;
      await restaurant.save();
    }

    res.status(201).json({ message: "Donation posted successfully", donation: serializeDonation(donation, restaurant) });
  } catch (err) {
    next(err);
  }
};

// GET /api/restaurant/donations
export const getDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ restaurantId: req.user._id }).sort({ createdAt: -1 });
    const restaurant = req.user;
    res.json(donations.map((d) => serializeDonation(d, restaurant)));
  } catch (err) {
    next(err);
  }
};

// PUT /api/restaurant/donations/:id
export const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, restaurantId: req.user._id });
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "available") return res.status(400).json({ message: "Cannot modify claimed or completed donations" });

    const fields = ["title", "description", "food_type", "quantity", "weight_kg", "expiry_time", "image_url"];
    if (req.body.title) donation.title = req.body.title;
    if (req.body.description !== undefined) donation.description = req.body.description;
    if (req.body.food_type) donation.foodType = req.body.food_type;
    if (req.body.quantity) donation.quantity = parseFloat(req.body.quantity);
    if (req.body.weight_kg) {
      donation.weightKg = parseFloat(req.body.weight_kg);
      donation.co2Saved = calculateCO2Saved(donation.weightKg);
    }
    if (req.body.expiry_time) donation.expiryTime = new Date(req.body.expiry_time);
    if (req.body.image_url !== undefined) donation.imageUrl = req.body.image_url;

    await donation.save();
    res.json({ message: "Donation updated successfully", donation: serializeDonation(donation, req.user) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/restaurant/donations/:id
export const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, restaurantId: req.user._id });
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "available") return res.status(400).json({ message: "Cannot delete claimed or completed donations" });

    await donation.deleteOne();
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// PUT /api/restaurant/profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, address, latitude, longitude, description, license_number, banner_image } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;
    if (user.restaurantProfile) {
      if (description !== undefined) user.restaurantProfile.description = description;
      if (license_number) user.restaurantProfile.licenseNumber = license_number;
      if (banner_image !== undefined) user.restaurantProfile.bannerImage = banner_image;
    }

    await user.save({ validateModifiedOnly: true });
    res.json({ message: "Profile updated successfully", user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/restaurant/ai-recommend/:id
export const getAIRecommendations = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, restaurantId: req.user._id });
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    const ngos = await User.find({ role: "ngo", status: "verified" });
    const recommendations = suggestNearestNGOs(donation, ngos);
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
};

// Helper to serialize donation with restaurant info
const serializeDonation = (d, restaurant) => ({
  id: d._id,
  restaurant_id: d.restaurantId,
  restaurant_name: restaurant?.name || "Unknown",
  restaurant_address: restaurant?.address || "Unknown",
  restaurant_latitude: restaurant?.latitude || null,
  restaurant_longitude: restaurant?.longitude || null,
  title: d.title,
  description: d.description,
  food_type: d.foodType,
  quantity: d.quantity,
  weight_kg: d.weightKg,
  status: d.status,
  expiry_time: d.expiryTime,
  created_at: d.createdAt,
  image_url: d.imageUrl,
  co2_saved: d.co2Saved,
  claim: null,
});
