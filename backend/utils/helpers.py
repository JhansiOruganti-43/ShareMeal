import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points
    on the Earth's surface using the Haversine formula.
    Returns distance in kilometers.
    """
    if None in (lat1, lon1, lat2, lon2):
        return float('inf')
        
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return round(c * r, 2)

def calculate_co2_saved(weight_kg):
    """
    Estimate CO2 offset in kg based on food waste saved.
    Standard metric: 1 kg of food saved prevents approx 2.5 kg of CO2 equivalent emissions.
    """
    if not weight_kg:
        return 0.0
    return round(weight_kg * 2.5, 2)

def calculate_meals_saved(weight_kg):
    """
    Convert weight of food saved into equivalent meals.
    Assume standard meal is 0.5 kg (500g).
    """
    if not weight_kg:
        return 0.0
    return int(weight_kg * 2.0)

def suggest_nearest_ngos(donation, verified_ngos, limit=5):
    """
    Suggests the nearest NGOs to a given donation's restaurant location.
    Ranks them based on distance and calculates matching score based on ratings.
    """
    rest = donation.restaurant
    if not rest or rest.latitude is None or rest.longitude is None:
        return []
        
    suggestions = []
    for ngo in verified_ngos:
        if ngo.latitude is None or ngo.longitude is None:
            continue
            
        dist = haversine_distance(rest.latitude, rest.longitude, ngo.latitude, ngo.longitude)
        
        # Calculate matching score (higher is better)
        # Closer NGOs and NGOs with higher ratings get higher match scores
        ngo_rating = ngo.ngo_profile.rating if ngo.ngo_profile else 5.0
        # If distance is extremely small, keep denominator active
        dist_factor = 1.0 / (dist + 0.1)
        match_score = round((dist_factor * 10) + (ngo_rating * 2), 2)
        
        suggestions.append({
            'ngo_id': ngo.id,
            'name': ngo.name,
            'phone': ngo.phone,
            'address': ngo.address,
            'latitude': ngo.latitude,
            'longitude': ngo.longitude,
            'distance_km': dist,
            'rating': ngo_rating,
            'match_score': match_score
        })
        
    # Sort suggestions by distance (ascending) then match score (descending)
    suggestions.sort(key=lambda x: (x['distance_km'], -x['match_score']))
    return suggestions[:limit]
