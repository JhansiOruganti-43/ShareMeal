/**
 * Calculate CO2 saved based on weight of food rescued (kg)
 * 2.5 kg CO2 equivalent per kg of food waste
 */
export const calculateCO2Saved = (weightKg) => {
  return Math.round(weightKg * 2.5 * 100) / 100;
};

/**
 * Haversine formula to calculate straight-line distance (km) between two lat/lng points
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Suggest nearest NGOs for a given donation
 */
export const suggestNearestNGOs = (donation, ngos) => {
  const results = ngos
    .map((ngo) => {
      let dist = null;
      if (
        ngo.latitude != null &&
        ngo.longitude != null &&
        donation.restaurantId?.latitude != null
      ) {
        dist = haversineDistance(
          donation.restaurantId.latitude,
          donation.restaurantId.longitude,
          ngo.latitude,
          ngo.longitude
        );
      }
      return {
        id: ngo._id,
        name: ngo.name,
        address: ngo.address,
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        distance_km: dist,
        rating: ngo.ngoProfile?.rating || 5.0,
      };
    })
    .sort((a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999))
    .slice(0, 5);

  return results;
};
