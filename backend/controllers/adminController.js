import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Notification from "../models/Notification.js";

// GET /api/admin/users/pending
export const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(users.map((u) => u.toPublic()));
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users/:id/verify
export const verifyUser = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be verified or rejected" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save({ validateModifiedOnly: true });

    const msg =
      status === "verified"
        ? "Your ShareMeal account has been successfully verified! You can now log in."
        : "Your ShareMeal account verification request was rejected. Please contact support.";

    await Notification.create({ userId: user._id, message: msg, type: "info" });

    res.json({ message: `User is now ${status}`, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users.map((u) => u.toPublic()));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }
    await user.deleteOne();
    res.json({ message: "User account removed successfully" });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/donations
export const getAllDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const restaurantIds = [...new Set(donations.map((d) => String(d.restaurantId)))];
    const restaurants = await User.find({ _id: { $in: restaurantIds } });
    const restaurantMap = Object.fromEntries(restaurants.map((r) => [String(r._id), r]));

    res.json(donations.map((d) => ({
      id: d._id,
      restaurant_id: d.restaurantId,
      restaurant_name: restaurantMap[String(d.restaurantId)]?.name || "Unknown",
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
    })));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/donations/:id
export const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    await donation.deleteOne();
    res.json({ message: "Donation listing removed successfully" });
  } catch (err) {
    next(err);
  }
};
