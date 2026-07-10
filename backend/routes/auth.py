from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, RestaurantProfile, NGOProfile, PasswordResetOTP
import random
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
from flask import current_app

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
        
    if role not in ['restaurant', 'ngo']:
        return jsonify({'message': 'Invalid role or role not allowed from frontend'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400
        
    # Default status: Restaurants/NGOs start as pending
    status = 'pending'
    
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

# Function to send email
def send_otp_email(receiver_email, otp):
    try:
        msg = EmailMessage()
        msg.set_content(f"Your password reset OTP is: {otp}\nThis OTP is valid for 10 minutes.")
        msg['Subject'] = 'ShareMeal - Password Reset OTP'
        msg['From'] = current_app.config['MAIL_DEFAULT_SENDER']
        msg['To'] = receiver_email
        
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        if current_app.config['MAIL_USE_TLS']:
            server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Return success regardless for security, but don't actually do anything
        return jsonify({'message': 'If this email is registered, we have sent an OTP.'}), 200
        
    otp = str(random.randint(1000, 9999))
    
    # In a real-world usage, we also want to invalidate older otps or simply delete them
    PasswordResetOTP.query.filter_by(email=email).delete()
    
    reset_entry = PasswordResetOTP(
        email=email,
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.session.add(reset_entry)
    db.session.commit()
    
    # Try sending real email
    # If using placeholders, it will fail and just print to console. We'll simulate success for the demo.
    send_otp_email(email, otp)
    
    # For local development where you can't check email, we print it to console
    print(f"DEBUG: Forgot Password OTP for {email} is {otp}")
    
    return jsonify({'message': 'If this email is registered, we have sent an OTP.'}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400
        
    otp_record = PasswordResetOTP.query.filter_by(email=email, otp=otp).first()
    if not otp_record or not otp_record.is_valid():
        return jsonify({'message': 'Invalid or expired OTP'}), 400
        
    # Return a temporary token or simple success message to let them proceed to reset phase
    # In a real robust system, we generate a reset-token here. For simplicity, we can let the reset-password check OTP again.
    return jsonify({'message': 'OTP verified successfully.'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    if not all([email, otp, new_password]):
        return jsonify({'message': 'All fields are required'}), 400
        
    otp_record = PasswordResetOTP.query.filter_by(email=email, otp=otp).first()
    if not otp_record or not otp_record.is_valid():
        return jsonify({'message': 'Invalid or expired OTP'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user.set_password(new_password)
    PasswordResetOTP.query.filter_by(email=email).delete()
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully.'}), 200
