import crypto from "crypto";
import Donation from "../models/Donation.js";
import Claim from "../models/Claim.js";
import Rating from "../models/Rating.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { haversineDistance } from "../utils/helpers.js";

// GET /api/ngo/donations
export const getAvailableDonations = async (req, res, next) => {
  try {
    const { food_type, max_distance } = req.query;
    const ngo = req.user;

    const query = { status: "available", expiryTime: { $gt: new Date() } };
    if (food_type) query.foodType = food_type;

    const donations = await Donation.find(query).sort({ createdAt: -1 });

    const restaurantIds = [...new Set(donations.map((d) => String(d.restaurantId)))];
    const restaurants = await User.find({ _id: { $in: restaurantIds } });
    const restaurantMap = Object.fromEntries(restaurants.map((r) => [String(r._id), r]));

    // Attach claim info
    const claimMap = {};
    const claims = await Claim.find({ donationId: { $in: donations.map((d) => d._id) } });
    claims.forEach((c) => { claimMap[String(c.donationId)] = c; });

    let result = donations.map((d) => {
      const restaurant = restaurantMap[String(d.restaurantId)];
      let dist = null;
      if (ngo.latitude != null && ngo.longitude != null && restaurant?.latitude != null && restaurant?.longitude != null) {
        dist = haversineDistance(ngo.latitude, ngo.longitude, restaurant.latitude, restaurant.longitude);
      }
      return {
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
        distance_km: dist,
        claim: claimMap[String(d._id)] || null,
      };
    });

    if (max_distance) {
      result = result.filter((d) => d.distance_km == null || d.distance_km <= parseFloat(max_distance));
    }
    result.sort((a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/ngo/claim
export const claimDonation = async (req, res, next) => {
  try {
    const { donation_id } = req.body;
    if (!donation_id) return res.status(400).json({ message: "donation_id is required" });

    const donation = await Donation.findById(donation_id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "available") return res.status(400).json({ message: "Donation is already claimed or completed" });
    if (donation.expiryTime < new Date()) return res.status(400).json({ message: "Donation has expired" });

    const qrHash = crypto.randomBytes(6).toString("hex").toUpperCase();

    const claim = await Claim.create({
      donationId: donation._id,
      ngoId: req.user._id,
      qrCodeHash: qrHash,
      status: "pending_pickup",
    });

    donation.status = "claimed";
    await donation.save();

    await Notification.create({
      userId: donation.restaurantId,
      message: `NGO '${req.user.name}' has claimed your donation: '${donation.title}'. Use QR Code '${qrHash}' to confirm pickup.`,
      type: "claim",
    });

    res.status(201).json({
      message: "Donation claimed successfully",
      claim: {
        id: claim._id,
        donation_id: claim.donationId,
        ngo_id: claim.ngoId,
        ngo_name: req.user.name,
        claimed_at: claim.createdAt,
        status: claim.status,
        qr_code_hash: claim.qrCodeHash,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/ngo/history
export const getClaimHistory = async (req, res, next) => {
  try {
    const claims = await Claim.find({ ngoId: req.user._id }).sort({ createdAt: -1 });

    const donationIds = claims.map((c) => c.donationId);
    const donations = await Donation.find({ _id: { $in: donationIds } });
    const donationMap = Object.fromEntries(donations.map((d) => [String(d._id), d]));

    const restaurantIds = [...new Set(donations.map((d) => String(d.restaurantId)))];
    const restaurants = await User.find({ _id: { $in: restaurantIds } });
    const restaurantMap = Object.fromEntries(restaurants.map((r) => [String(r._id), r]));

    const ratingMap = {};
    const ratings = await Rating.find({ claimId: { $in: claims.map((c) => c._id) }, ratedBy: req.user._id });
    ratings.forEach((r) => { ratingMap[String(r.claimId)] = r; });

    const result = claims.map((c) => {
      const donation = donationMap[String(c.donationId)];
      const restaurant = donation ? restaurantMap[String(donation.restaurantId)] : null;
      const rating = ratingMap[String(c._id)];

      return {
        id: c._id,
        donation_id: c.donationId,
        ngo_id: c.ngoId,
        ngo_name: req.user.name,
        claimed_at: c.createdAt,
        status: c.status,
        pickup_time: c.pickupTime,
        qr_code_hash: c.qrCodeHash,
        donation: donation ? {
          id: donation._id,
          title: donation.title,
          description: donation.description,
          food_type: donation.foodType,
          quantity: donation.quantity,
          weight_kg: donation.weightKg,
          status: donation.status,
          expiry_time: donation.expiryTime,
          image_url: donation.imageUrl,
          co2_saved: donation.co2Saved,
          restaurant_name: restaurant?.name || "Unknown",
          restaurant_address: restaurant?.address || "Unknown",
        } : null,
        is_rated: !!rating,
        rating: rating ? { id: rating._id, score: rating.score, comment: rating.comment } : null,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/ngo/confirm-pickup
export const confirmPickup = async (req, res, next) => {
  try {
    const { claim_id, qr_code_hash } = req.body;
    if (!claim_id || !qr_code_hash) return res.status(400).json({ message: "claim_id and qr_code_hash are required" });

    const claim = await Claim.findById(claim_id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (claim.status !== "pending_pickup") return res.status(400).json({ message: "Claim status is not pending pickup" });
    if (claim.qrCodeHash !== qr_code_hash.toUpperCase()) return res.status(400).json({ message: "Invalid QR code" });

    const donation = await Donation.findById(claim.donationId);

    claim.status = "completed";
    claim.pickupTime = new Date();
    await claim.save();

    if (donation) {
      donation.status = "completed";
      await donation.save();

      // Award bonus points to restaurant
      const restaurant = await User.findById(donation.restaurantId);
      if (restaurant?.restaurantProfile) {
        restaurant.restaurantProfile.badgePoints += 30;
        await restaurant.save();
      }

      await Notification.create({
        userId: donation.restaurantId,
        message: `Donation '${donation.title}' pickup confirmed by NGO '${req.user.name}'.`,
        type: "info",
      });
    }

    await Notification.create({
      userId: claim.ngoId,
      message: `Pickup for '${donation?.title || "donation"}' complete. Please leave a rating!`,
      type: "info",
    });

    res.json({ message: "Pickup verified successfully", claim });
  } catch (err) {
    next(err);
  }
};

// POST /api/ngo/rate
export const ratePickup = async (req, res, next) => {
  try {
    const { claim_id, score, comment } = req.body;
    if (!claim_id || !score) return res.status(400).json({ message: "claim_id and score are required" });
    if (score < 1 || score > 5) return res.status(400).json({ message: "Score must be between 1 and 5" });

    const claim = await Claim.findById(claim_id);
    if (!claim || String(claim.ngoId) !== String(req.user._id)) return res.status(404).json({ message: "Claim not found or unauthorized" });
    if (claim.status !== "completed") return res.status(400).json({ message: "Cannot rate an incomplete claim" });

    const existing = await Rating.findOne({ claimId: claim_id, ratedBy: req.user._id });
    if (existing) return res.status(400).json({ message: "You have already rated this claim" });

    const donation = await Donation.findById(claim.donationId);
    if (!donation) return res.status(404).json({ message: "Associated donation not found" });

    const rating = await Rating.create({
      claimId: claim._id,
      ratedBy: req.user._id,
      ratedFor: donation.restaurantId,
      score: parseInt(score),
      comment: comment || "",
    });

    // Recompute restaurant average rating
    const allRatings = await Rating.find({ ratedFor: donation.restaurantId });
    const avg = allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length;
    const restaurant = await User.findById(donation.restaurantId);
    if (restaurant?.restaurantProfile) {
      restaurant.restaurantProfile.rating = Math.round(avg * 10) / 10;
      await restaurant.save();
    }

    res.status(201).json({ message: "Rating submitted successfully", rating });
  } catch (err) {
    next(err);
  }
};

// PUT /api/ngo/profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, address, latitude, longitude, description, registration_number, logo_image } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;
    if (user.ngoProfile) {
      if (description !== undefined) user.ngoProfile.description = description;
      if (registration_number) user.ngoProfile.registrationNumber = registration_number;
      if (logo_image !== undefined) user.ngoProfile.logoImage = logo_image;
    }

    await user.save({ validateModifiedOnly: true });
    res.json({ message: "Profile updated successfully", user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};
