from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Donation, Claim, RestaurantProfile, Notification
from datetime import datetime
from utils.helpers import calculate_co2_saved, suggest_nearest_ngos

restaurant_bp = Blueprint('restaurant', __name__)

# Middleware helper to verify restaurant role
def get_restaurant_or_error():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'restaurant':
        return None, jsonify({'message': 'Access restricted to restaurants only'}), 403
    return user, None

@restaurant_bp.route('/donations', methods=['POST'])
@jwt_required()
def add_donation():
    rest, err = get_restaurant_or_error()
    if err:
        return err
        
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description', '')
    food_type = data.get('food_type')
    quantity = data.get('quantity')
    weight_kg = data.get('weight_kg')
    expiry_time_str = data.get('expiry_time')
    image_url = data.get('image_url', '')
    
    if not all([title, food_type, quantity, weight_kg, expiry_time_str]):
        return jsonify({'message': 'Missing required donation fields'}), 400
        
    try:
        expiry_time = datetime.fromisoformat(expiry_time_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'message': 'Invalid ISO expiry date format'}), 400
        
    co2_val = calculate_co2_saved(float(weight_kg))
    
    donation = Donation(
        restaurant_id=rest.id,
        title=title,
        description=description,
        food_type=food_type,
        quantity=float(quantity),
        weight_kg=float(weight_kg),
        expiry_time=expiry_time,
        image_url=image_url,
        co2_saved=co2_val
    )
    
    try:
        db.session.add(donation)
        
        # Award badge points for creating donation
        if rest.restaurant_profile:
            rest.restaurant_profile.badge_points += 10
            
        db.session.commit()
        return jsonify({'message': 'Donation posted successfully', 'donation': donation.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@restaurant_bp.route('/donations', methods=['GET'])
@jwt_required()
def get_donations():
    rest, err = get_restaurant_or_error()
    if err:
        return err
        
    # Get all donations belonging to the restaurant
    donations = Donation.query.filter_by(restaurant_id=rest.id).order_by(Donation.created_at.desc()).all()
    return jsonify([d.to_dict() for d in donations]), 200

@restaurant_bp.route('/donations/<int:donation_id>', methods=['PUT'])
@jwt_required()
def update_donation(donation_id):
    rest, err = get_restaurant_or_error()
    if err:
        return err
        
    donation = Donation.query.filter_by(id=donation_id, restaurant_id=rest.id).first()
    if not donation:
        return jsonify({'message': 'Donation not found'}), 404
        
    if donation.status != 'available':
        return jsonify({'message': 'Cannot modify claimed or completed donations'}), 400
        
    data = request.get_json() or {}
    donation.title = data.get('title', donation.title)
    donation.description = data.get('description', donation.description)
    donation.food_type = data.get('food_type', donation.food_type)
    donation.quantity = float(data.get('quantity', donation.quantity))
    
    weight_kg = data.get('weight_kg')
    if weight_kg:
        donation.weight_kg = float(weight_kg)
        donation.co2_saved = calculate_co2_saved(donation.weight_kg)
        
    expiry_time_str = data.get('expiry_time')
    if expiry_time_str:
        try:
            donation.expiry_time = datetime.fromisoformat(expiry_time_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Invalid ISO expiry date format'}), 400
            
    donation.image_url = data.get('image_url', donation.image_url)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Donation updated successfully', 'donation': donation.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@restaurant_bp.route('/donations/<int:donation_id>', methods=['DELETE'])
@jwt_required()
def delete_donation(donation_id):
    rest, err = get_restaurant_or_error()
    if err:
        return err
        
    donation = Donation.query.filter_by(id=donation_id, restaurant_id=rest.id).first()
    if not donation:
        return jsonify({'message': 'Donation not found'}), 404
        
    if donation.status != 'available':
        return jsonify({'message': 'Cannot delete claimed or completed donations'}), 400
        
    try:
        db.session.delete(donation)
        db.session.commit()
        return jsonify({'message': 'Donation deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@restaurant_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    rest, err = get_restaurant_or_error()
    if err:
        return err
        
    data = request.get_json() or {}
    
    # Update user details
    rest.name = data.get('name', rest.name)
    rest.phone = data.get('phone', rest.phone)
    rest.address = data.get('address', rest.address)
    rest.latitude = data.get('latitude', rest.latitude)
    rest.longitude = data.get('longitude', rest.longitude)
    
    # Update profile details
    if rest.restaurant_profile:
        rest.restaurant_profile.description = data.get('description', rest.restaurant_profile.description)
        rest.restaurant_profile.license_number = data.get('license_number', rest.restaurant_profile.license_number)
        rest.restaurant_profile.banner_image = data.get('banner_image', rest.restaurant_profile.banner_image)
        
    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'user': rest.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@restaurant_bp.route('/ai-recommend/<int:donation_id>', methods=['GET'])
@jwt_required()
def get_ai_recommendations(donation_id):
    rest, err = get_restaurant_or_error()
    if err:
        return err
        
    donation = Donation.query.filter_by(id=donation_id, restaurant_id=rest.id).first()
    if not donation:
        return jsonify({'message': 'Donation not found'}), 404
        
    # Query all verified NGOs
    ngos = User.query.filter_by(role='ngo', status='verified').all()
    
    recommendations = suggest_nearest_ngos(donation, ngos)
    return jsonify(recommendations), 200
