import hashlib
import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Donation, Claim, NGOProfile, Notification, Rating, RestaurantProfile
from datetime import datetime
from utils.helpers import haversine_distance

ngo_bp = Blueprint('ngo', __name__)

# Middleware helper to verify NGO role
def get_ngo_or_error():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'ngo':
        return None, jsonify({'message': 'Access restricted to NGOs only'}), 403
    return user, None

@ngo_bp.route('/donations', methods=['GET'])
@jwt_required()
def get_available_donations():
    ngo, err = get_ngo_or_error()
    if err:
        return err
        
    # Get filters
    food_type = request.args.get('food_type')
    max_distance = request.args.get('max_distance', type=float) # in km
    
    # Query only available and unexpired donations
    now = datetime.utcnow()
    query = Donation.query.filter(
        Donation.status == 'available',
        Donation.expiry_time > now
    )
    
    if food_type:
        query = query.filter(Donation.food_type == food_type)
        
    donations = query.all()
    
    # Map with distance calculation
    result = []
    for d in donations:
        d_dict = d.to_dict()
        dist = None
        if ngo.latitude is not None and ngo.longitude is not None and d.restaurant.latitude is not None and d.restaurant.longitude is not None:
            dist = haversine_distance(ngo.latitude, ngo.longitude, d.restaurant.latitude, d.restaurant.longitude)
            
        # Skip if distance filter is active and exceeded
        if max_distance is not None and (dist is None or dist > max_distance):
            continue
            
        d_dict['distance_km'] = dist
        result.append(d_dict)
        
    # Sort by distance (closest first)
    result.sort(key=lambda x: x.get('distance_km', 999999))
    return jsonify(result), 200

@ngo_bp.route('/claim', methods=['POST'])
@jwt_required()
def claim_donation():
    ngo, err = get_ngo_or_error()
    if err:
        return err
        
    data = request.get_json() or {}
    donation_id = data.get('donation_id')
    
    if not donation_id:
        return jsonify({'message': 'donation_id is required'}), 400
        
    donation = Donation.query.get(donation_id)
    if not donation:
        return jsonify({'message': 'Donation not found'}), 404
        
    if donation.status != 'available':
        return jsonify({'message': 'Donation is already claimed or completed'}), 400
        
    if donation.expiry_time < datetime.utcnow():
        return jsonify({'message': 'Donation has expired'}), 400
        
    # Generate QR Code hash
    qr_input = f"{donation.id}-{ngo.id}-{time.time()}"
    qr_hash = hashlib.sha256(qr_input.encode()).hexdigest()[:12].upper()
    
    claim = Claim(
        donation_id=donation.id,
        ngo_id=ngo.id,
        qr_code_hash=qr_hash,
        status='pending_pickup'
    )
    
    donation.status = 'claimed'
    
    # Notify restaurant
    notif = Notification(
        user_id=donation.restaurant_id,
        message=f"NGO '{ngo.name}' has claimed your donation: '{donation.title}'. Use QR Code '{qr_hash}' to confirm pickup.",
        type='claim'
    )
    
    try:
        db.session.add(claim)
        db.session.add(notif)
        db.session.commit()
        return jsonify({'message': 'Donation claimed successfully', 'claim': claim.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@ngo_bp.route('/history', methods=['GET'])
@jwt_required()
def get_claim_history():
    ngo, err = get_ngo_or_error()
    if err:
        return err
        
    claims = Claim.query.filter_by(ngo_id=ngo.id).order_by(Claim.claimed_at.desc()).all()
    
    result = []
    for c in claims:
        c_dict = c.to_dict()
        donation = Donation.query.get(c.donation_id)
        c_dict['donation'] = donation.to_dict() if donation else None
        
        # Check if already rated
        rating = Rating.query.filter_by(claim_id=c.id, rated_by=ngo.id).first()
        c_dict['is_rated'] = rating is not None
        if rating:
            c_dict['rating'] = rating.to_dict()
            
        result.append(c_dict)
        
    return jsonify(result), 200

@ngo_bp.route('/confirm-pickup', methods=['POST'])
@jwt_required()
def confirm_pickup():
    # Pickup can be completed by restaurant or NGO using the correct QR code hash
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    data = request.get_json() or {}
    claim_id = data.get('claim_id')
    qr_code_hash = data.get('qr_code_hash')
    
    if not claim_id or not qr_code_hash:
        return jsonify({'message': 'claim_id and qr_code_hash are required'}), 400
        
    claim = Claim.query.get(claim_id)
    if not claim:
        return jsonify({'message': 'Claim not found'}), 404
        
    if claim.status != 'pending_pickup':
        return jsonify({'message': 'Claim status is not pending pickup'}), 400
        
    if claim.qr_code_hash != qr_code_hash.upper():
        return jsonify({'message': 'Invalid QR code code'}), 400
        
    donation = Donation.query.get(claim.donation_id)
    
    # Perform completion updates
    claim.status = 'completed'
    claim.pickup_time = datetime.utcnow()
    
    if donation:
        donation.status = 'completed'
        
        # Award extra points to restaurant
        rest_profile = RestaurantProfile.query.filter_by(user_id=donation.restaurant_id).first()
        if rest_profile:
            rest_profile.badge_points += 30  # 30 points for completion!
            
        # Send confirmation notification to restaurant
        notif_rest = Notification(
            user_id=donation.restaurant_id,
            message=f"Donation '{donation.title}' pickup confirmed by NGO '{claim.ngo.name}'.",
            type='info'
        )
        db.session.add(notif_rest)

    # Send confirmation notification to NGO
    notif_ngo = Notification(
        user_id=claim.ngo_id,
        message=f"Pickup for '{donation.title if donation else 'donation'}' complete. Please leave a rating!",
        type='info'
    )
    db.session.add(notif_ngo)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Pickup verified successfully', 'claim': claim.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@ngo_bp.route('/rate', methods=['POST'])
@jwt_required()
def rate_pickup():
    ngo, err = get_ngo_or_error()
    if err:
        return err
        
    data = request.get_json() or {}
    claim_id = data.get('claim_id')
    score = data.get('score')
    comment = data.get('comment', '')
    
    if not claim_id or not score:
        return jsonify({'message': 'claim_id and score are required'}), 400
        
    if score < 1 or score > 5:
        return jsonify({'message': 'Score must be between 1 and 5'}), 400
        
    claim = Claim.query.get(claim_id)
    if not claim or claim.ngo_id != ngo.id:
        return jsonify({'message': 'Claim not found or unauthorized'}), 404
        
    if claim.status != 'completed':
        return jsonify({'message': 'Cannot rate an incomplete claim'}), 400
        
    # Check if rating already exists
    existing = Rating.query.filter_by(claim_id=claim_id, rated_by=ngo.id).first()
    if existing:
        return jsonify({'message': 'You have already rated this claim'}), 400
        
    donation = Donation.query.get(claim.donation_id)
    if not donation:
        return jsonify({'message': 'Associated donation not found'}), 404
        
    rating = Rating(
        claim_id=claim.id,
        rated_by=ngo.id,
        rated_for=donation.restaurant_id,
        score=int(score),
        comment=comment
    )
    
    try:
        db.session.add(rating)
        db.session.flush() # Flush to db
        
        # Recompute restaurant profile rating
        all_ratings = Rating.query.filter_by(rated_for=donation.restaurant_id).all()
        avg_score = sum([r.score for r in all_ratings]) / len(all_ratings)
        
        rest_profile = RestaurantProfile.query.filter_by(user_id=donation.restaurant_id).first()
        if rest_profile:
            rest_profile.rating = round(avg_score, 1)
            
        db.session.commit()
        return jsonify({'message': 'Rating submitted successfully', 'rating': rating.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@ngo_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    ngo, err = get_ngo_or_error()
    if err:
        return err
        
    data = request.get_json() or {}
    
    ngo.name = data.get('name', ngo.name)
    ngo.phone = data.get('phone', ngo.phone)
    ngo.address = data.get('address', ngo.address)
    ngo.latitude = data.get('latitude', ngo.latitude)
    ngo.longitude = data.get('longitude', ngo.longitude)
    
    if ngo.ngo_profile:
        ngo.ngo_profile.description = data.get('description', ngo.ngo_profile.description)
        ngo.ngo_profile.registration_number = data.get('registration_number', ngo.ngo_profile.registration_number)
        ngo.ngo_profile.logo_image = data.get('logo_image', ngo.ngo_profile.logo_image)
        
    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'user': ngo.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500
