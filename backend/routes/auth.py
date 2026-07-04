from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, RestaurantProfile, NGOProfile

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    if not all([email, password, role, name, phone, address]):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if role not in ['restaurant', 'ngo', 'admin']:
        return jsonify({'message': 'Invalid role'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400
        
    # Default status: Admin is verified instantly; Restaurants/NGOs start as pending
    status = 'verified' if role == 'admin' else 'pending'
    
    user = User(
        email=email,
        role=role,
        name=name,
        phone=phone,
        address=address,
        latitude=latitude,
        longitude=longitude,
        status=status
    )
    user.set_password(password)
    
    try:
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Handle specific profiles
        if role == 'restaurant':
            license_number = data.get('license_number')
            description = data.get('description', '')
            if not license_number:
                db.session.rollback()
                return jsonify({'message': 'License number required for restaurants'}), 400
            
            profile = RestaurantProfile(
                user_id=user.id,
                license_number=license_number,
                description=description
            )
            db.session.add(profile)
            
        elif role == 'ngo':
            registration_number = data.get('registration_number')
            description = data.get('description', '')
            if not registration_number:
                db.session.rollback()
                return jsonify({'message': 'Registration number required for NGOs'}), 400
                
            profile = NGOProfile(
                user_id=user.id,
                registration_number=registration_number,
                description=description
            )
            db.session.add(profile)
            
        db.session.commit()
        return jsonify({'message': 'Registration successful. Awaiting admin approval.' if role != 'admin' else 'Registration successful.', 'user': user.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating user: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    # Check if user is pending/rejected
    if user.status == 'pending' and user.role != 'admin':
        return jsonify({'message': 'Your account is pending verification by administration.'}), 403
    elif user.status == 'rejected':
        return jsonify({'message': 'Your account verification request was rejected. Contact admin.'}), 403
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict()), 200
