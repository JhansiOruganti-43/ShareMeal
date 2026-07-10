export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined || lat1 === null || 
    lon1 === undefined || lon1 === null || 
    lat2 === undefined || lat2 === null || 
    lon2 === undefined || lon2 === null
  ) {
    return Infinity;
  }

  const toRadians = (deg) => (deg * Math.PI) / 180;
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rLat1) * Math.cos(rLat2) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  const r = 6371; // Radius of Earth in kilometers
  
  return Math.round(c * r * 100) / 100;
};

export const calculateCO2Saved = (weightKg) => {
  if (!weightKg) return 0.0;
  return Math.round(weightKg * 2.5 * 100) / 100;
};

export const calculateMealsSaved = (weightKg) => {
  if (!weightKg) return 0;
  return Math.floor(weightKg * 2.0);
};

export const suggestNearestNgos = (donation, ngos, limit = 5) => {
  const rest = donation.restaurant;
  if (!rest || rest.latitude === undefined || rest.latitude === null || rest.longitude === undefined || rest.longitude === null) {
    return [];
  }
  
  const suggestions = [];
  for (const ngo of ngos) {
    if (ngo.latitude === undefined || ngo.latitude === null || ngo.longitude === undefined || ngo.longitude === null) {
      continue;
    }
    
    const dist = haversineDistance(rest.latitude, rest.longitude, ngo.latitude, ngo.longitude);
    const ngoRating = (ngo.ngoProfile && ngo.ngoProfile.rating) !== undefined ? ngo.ngoProfile.rating : 5.0;
    
    const distFactor = 1.0 / (dist + 0.1);
    const matchScore = Math.round(((distFactor * 10) + (ngoRating * 2)) * 100) / 100;
    
    suggestions.push({
      ngo_id: ngo._id || ngo.id,
      name: ngo.name,
      phone: ngo.phone,
      address: ngo.address,
      latitude: ngo.latitude,
      longitude: ngo.longitude,
      distance_km: dist,
      rating: ngoRating,
      match_score: matchScore
    });
  }
  
  suggestions.sort((a, b) => {
    if (a.distance_km !== b.distance_km) {
      return a.distance_km - b.distance_km;
    }
    return b.match_score - a.match_score;
  });
  
  return suggestions.slice(0, limit);
};
