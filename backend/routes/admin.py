from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Donation, Notification

admin_bp = Blueprint('admin', __name__)

# Middleware helper to verify Admin role
def get_admin_or_error():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'admin':
        return None, jsonify({'message': 'Access restricted to administrators only'}), 403
    return user, None

@admin_bp.route('/users/pending', methods=['GET'])
@jwt_required()
def get_pending_users():
    admin, err = get_admin_or_error()
    if err:
        return err
        
    pending_users = User.query.filter_by(status='pending').order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in pending_users]), 200

@admin_bp.route('/users/<int:user_id>/verify', methods=['POST'])
@jwt_required()
def verify_user(user_id):
    admin, err = get_admin_or_error()
    if err:
        return err
        
    data = request.get_json() or {}
    status = data.get('status')  # 'verified' or 'rejected'
    
    if status not in ['verified', 'rejected']:
        return jsonify({'message': 'Status must be verified or rejected'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user.status = status
    
    # Notify user of their status update
    msg = f"Your ShareMeal account has been successfully verified! You can now log in." if status == 'verified' else "Your ShareMeal account verification request was rejected. Please contact support."
    notif = Notification(
        user_id=user.id,
        message=msg,
        type='info'
    )
    db.session.add(notif)
    
    try:
        db.session.commit()
        return jsonify({'message': f'User is now {status}', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    admin, err = get_admin_or_error()
    if err:
        return err
        
    role = request.args.get('role')
    query = User.query
    if role:
        query = query.filter_by(role=role)
        
    users = query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    admin, err = get_admin_or_error()
    if err:
        return err
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    if user.id == admin.id:
        return jsonify({'message': 'Cannot delete your own admin account'}), 400
        
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User account removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@admin_bp.route('/donations', methods=['GET'])
@jwt_required()
def get_all_donations():
    admin, err = get_admin_or_error()
    if err:
        return err
        
    donations = Donation.query.order_by(Donation.created_at.desc()).all()
    return jsonify([d.to_dict() for d in donations]), 200

@admin_bp.route('/donations/<int:donation_id>', methods=['DELETE'])
@jwt_required()
def delete_donation(donation_id):
    admin, err = get_admin_or_error()
    if err:
        return err
        
    donation = Donation.query.get(donation_id)
    if not donation:
        return jsonify({'message': 'Donation not found'}), 404
        
    try:
        db.session.delete(donation)
        db.session.commit()
        return jsonify({'message': 'Donation listing removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500
