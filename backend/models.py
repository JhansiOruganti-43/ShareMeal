from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'restaurant', 'ngo'
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'verified', 'rejected'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    restaurant_profile = db.relationship('RestaurantProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    ngo_profile = db.relationship('NGOProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    donations = db.relationship('Donation', backref='restaurant', lazy=True, cascade="all, delete-orphan")
    claims = db.relationship('Claim', backref='ngo', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        profile = None
        if self.role == 'restaurant' and self.restaurant_profile:
            profile = self.restaurant_profile.to_dict()
        elif self.role == 'ngo' and self.ngo_profile:
            profile = self.ngo_profile.to_dict()
            
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'name': self.name,
            'phone': self.phone,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'profile': profile
        }

class RestaurantProfile(db.Model):
    __tablename__ = 'restaurant_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    license_number = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    banner_image = db.Column(db.String(256), nullable=True)
    rating = db.Column(db.Float, default=5.0)
    badge_points = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'license_number': self.license_number,
            'description': self.description,
            'banner_image': self.banner_image,
            'rating': self.rating,
            'badge_points': self.badge_points
        }

class NGOProfile(db.Model):
    __tablename__ = 'ngo_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    registration_number = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    logo_image = db.Column(db.String(256), nullable=True)
    rating = db.Column(db.Float, default=5.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'registration_number': self.registration_number,
            'description': self.description,
            'logo_image': self.logo_image,
            'rating': self.rating
        }

class Donation(db.Model):
    __tablename__ = 'donations'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    food_type = db.Column(db.String(20), nullable=False)  # 'veg', 'non-veg', 'vegan'
    quantity = db.Column(db.Float, nullable=False)  # servings count
    weight_kg = db.Column(db.Float, nullable=False)  # in KG
    status = db.Column(db.String(20), default='available')  # 'available', 'claimed', 'completed', 'expired'
    expiry_time = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(256), nullable=True)
    co2_saved = db.Column(db.Float, default=0.0)
    
    # Relationship to claim
    claim = db.relationship('Claim', backref='donation', uselist=False, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'restaurant_name': self.restaurant.name if self.restaurant else 'Unknown',
            'restaurant_address': self.restaurant.address if self.restaurant else 'Unknown',
            'restaurant_latitude': self.restaurant.latitude if self.restaurant else None,
            'restaurant_longitude': self.restaurant.longitude if self.restaurant else None,
            'title': self.title,
            'description': self.description,
            'food_type': self.food_type,
            'quantity': self.quantity,
            'weight_kg': self.weight_kg,
            'status': self.status,
            'expiry_time': self.expiry_time.isoformat(),
            'created_at': self.created_at.isoformat(),
            'image_url': self.image_url,
            'co2_saved': self.co2_saved,
            'claim': self.claim.to_dict() if self.claim else None
        }

class Claim(db.Model):
    __tablename__ = 'claims'
    
    id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('donations.id', ondelete='CASCADE'), unique=True, nullable=False)
    ngo_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    claimed_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending_pickup')  # 'pending_pickup', 'completed', 'cancelled'
    pickup_time = db.Column(db.DateTime, nullable=True)
    qr_code_hash = db.Column(db.String(256), nullable=True)
    
    # Relationship to ratings
    ratings = db.relationship('Rating', backref='claim', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'donation_id': self.donation_id,
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.name if self.ngo else 'Unknown',
            'claimed_at': self.claimed_at.isoformat(),
            'status': self.status,
            'pickup_time': self.pickup_time.isoformat() if self.pickup_time else None,
            'qr_code_hash': self.qr_code_hash
        }

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id', ondelete='CASCADE'), nullable=False)
    rated_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    rated_for = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'claim_id': self.claim_id,
            'rated_by': self.rated_by,
            'rated_for': self.rated_for,
            'score': self.score,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.String(256), nullable=False)
    type = db.Column(db.String(20), default='info')  # 'info', 'claim', 'reminder'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class PasswordResetOTP(db.Model):
    __tablename__ = 'password_reset_otps'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    otp = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    def is_valid(self):
        return datetime.utcnow() <= self.expires_at
