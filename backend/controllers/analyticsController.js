import Donation from "../models/Donation.js";
import Claim from "../models/Claim.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";

// GET /api/analytics/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    // 1. Aggregate completed donations for weight / co2
    const completedAgg = await Donation.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalWeight: { $sum: "$weightKg" }, totalCO2: { $sum: "$co2Saved" } } },
    ]);

    const totalWeight = completedAgg[0]?.totalWeight || 0;
    const totalCO2 = completedAgg[0]?.totalCO2 || 0;
    const totalMeals = Math.floor(totalWeight * 2);

    // 2. Unique NGOs with completed claims
    const ngoDistinct = await Claim.distinct("ngoId", { status: "completed" });
    const ngoCount = ngoDistinct.length;

    // 3. Verified restaurants & NGOs count
    const restaurantCount = await User.countDocuments({ role: "restaurant", status: "verified" });
    const ngoTotalCount = await User.countDocuments({ role: "ngo", status: "verified" });

    // 4. Leaderboard — top 5 restaurants by badge points
    const topRestaurants = await User.find({ role: "restaurant", status: "verified" })
      .sort({ "restaurantProfile.badgePoints": -1 })
      .limit(5);

    const leaderboard = await Promise.all(
      topRestaurants.map(async (r) => {
        const points = r.restaurantProfile?.badgePoints || 0;
        const completedDonationCount = await Donation.countDocuments({ restaurantId: r._id, status: "completed" });
        let badge = "Bronze Donor";
        if (points >= 200) badge = "Gold Hero";
        else if (points >= 100) badge = "Silver Champion";

        return {
          id: r._id,
          name: r.name,
          points,
          rating: r.restaurantProfile?.rating || 5.0,
          completed_donations: completedDonationCount,
          badge,
        };
      })
    );

    // 5. Monthly trend (last 6 months)
    const monthly_data = [];
    for (let i = 5; i >= 0; i--) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthAgg = await Donation.aggregate([
        { $match: { status: "completed", createdAt: { $gte: firstDay, $lt: lastDay } } },
        { $group: { _id: null, weight: { $sum: "$weightKg" }, co2: { $sum: "$co2Saved" } } },
      ]);

      const weight = monthAgg[0]?.weight || 0;
      const co2 = monthAgg[0]?.co2 || 0;

      monthly_data.push({
        month: firstDay.toLocaleString("default", { month: "short" }),
        weight_kg: Math.round(weight * 10) / 10,
        meals: Math.floor(weight * 2),
        co2_saved_kg: Math.round(co2 * 10) / 10,
      });
    }

    res.json({
      total_weight_kg: Math.round(totalWeight * 10) / 10,
      total_meals_saved: totalMeals,
      total_co2_saved_kg: Math.round(totalCO2 * 10) / 10,
      ngos_served_count: ngoCount,
      active_restaurants_count: restaurantCount,
      active_ngos_count: ngoTotalCount,
      leaderboard,
      monthly_trend: monthly_data,
    });
  } catch (err) {
    next(err);
  }
};
