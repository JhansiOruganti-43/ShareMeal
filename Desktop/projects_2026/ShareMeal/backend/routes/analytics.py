from flask import Blueprint, jsonify
from models import db, User, Donation, Claim, RestaurantProfile
from datetime import datetime, timedelta
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
def get_analytics():
    # 1. Total Weight & CO2 Saved & Meals Saved (Only completed donations)
    completed_stats = db.session.query(
        func.sum(Donation.weight_kg),
        func.sum(Donation.co2_saved)
    ).filter(Donation.status == 'completed').first()
    
    total_weight = completed_stats[0] or 0.0
    total_co2 = completed_stats[1] or 0.0
    total_meals = int(total_weight * 2)  # 2 meals per kg
    
    # 2. NGOs served (Unique NGOs with completed claims)
    ngo_count = db.session.query(Claim.ngo_id).filter(Claim.status == 'completed').distinct().count()
    
    # 3. Active Restaurants (Verified restaurants)
    restaurant_count = User.query.filter_by(role='restaurant', status='verified').count()
    
    # 4. Total NGOs (Verified NGOs)
    total_ngo_count = User.query.filter_by(role='ngo', status='verified').count()
    
    # 5. Top donating restaurants leaderboard
    top_restaurants = db.session.query(
        User.id,
        User.name,
        RestaurantProfile.badge_points,
        RestaurantProfile.rating,
        func.count(Donation.id).label('donation_count')
    ).join(RestaurantProfile, User.id == RestaurantProfile.user_id)\
     .outerjoin(Donation, (User.id == Donation.restaurant_id) & (Donation.status == 'completed'))\
     .filter(User.role == 'restaurant', User.status == 'verified')\
     .group_by(User.id, User.name, RestaurantProfile.badge_points, RestaurantProfile.rating)\
     .order_by(RestaurantProfile.badge_points.desc())\
     .limit(5).all()
     
    leaderboard = []
    for r in top_restaurants:
        # Determine badges based on points
        points = r.badge_points
        badge = "Bronze Donor"
        if points >= 200:
            badge = "Gold Hero"
        elif points >= 100:
            badge = "Silver Champion"
            
        leaderboard.append({
            'id': r.id,
            'name': r.name,
            'points': points,
            'rating': r.rating,
            'completed_donations': r.donation_count,
            'badge': badge
        })
        
    # 6. Monthly trend data (last 6 months)
    # We will generate a list of monthly completions
    monthly_data = []
    today = datetime.utcnow()
    
    for i in range(5, -1, -1):
        # Calculate start and end of that month
        first_day_of_month = (today.replace(day=1) - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # Next month start
        if i == 0:
            next_month_start = today + timedelta(days=1)
        else:
            next_month_start = (today.replace(day=1) - timedelta(days=30 * (i - 1))).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
        weight_sum = db.session.query(func.sum(Donation.weight_kg))\
            .filter(Donation.status == 'completed')\
            .filter(Donation.created_at >= first_day_of_month)\
            .filter(Donation.created_at < next_month_start).scalar() or 0.0
            
        meals_sum = int(weight_sum * 2)
        co2_sum = round(weight_sum * 2.5, 2)
        
        month_name = first_day_of_month.strftime('%b')
        monthly_data.append({
            'month': month_name,
            'weight_kg': round(weight_sum, 1),
            'meals': meals_sum,
            'co2_saved_kg': co2_sum
        })

    return jsonify({
        'total_weight_kg': round(total_weight, 1),
        'total_meals_saved': total_meals,
        'total_co2_saved_kg': round(total_co2, 1),
        'ngos_served_count': ngo_count,
        'active_restaurants_count': restaurant_count,
        'active_ngos_count': total_ngo_count,
        'leaderboard': leaderboard,
        'monthly_trend': monthly_data
    }), 200
