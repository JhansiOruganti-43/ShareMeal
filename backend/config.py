import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sharemeal-dev-secret-key-12983719283')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///sharemeal.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-secret-key-92837192837123')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
