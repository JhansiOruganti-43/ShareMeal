import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from config import Config
from models import db, Notification

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app)
    
    # Initialize Database
    db.init_app(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.restaurant import restaurant_bp
    from routes.ngo import ngo_bp
    from routes.admin import admin_bp
    from routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(restaurant_bp, url_prefix='/api/restaurant')
    app.register_blueprint(ngo_bp, url_prefix='/api/ngo')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Notification endpoints
    @app.route('/api/notifications', methods=['GET'])
    @jwt_required()
    def get_notifications():
        user_id = get_jwt_identity()
        notifs = Notification.query.filter_by(user_id=int(user_id)).order_by(Notification.created_at.desc()).limit(20).all()
        return jsonify([n.to_dict() for n in notifs]), 200
        
    @app.route('/api/notifications/<int:notif_id>/read', methods=['POST'])
    @jwt_required()
    def mark_notification_read(notif_id):
        user_id = get_jwt_identity()
        notif = Notification.query.filter_by(id=notif_id, user_id=int(user_id)).first()
        if not notif:
            return jsonify({'message': 'Notification not found'}), 404
        notif.is_read = True
        db.session.commit()
        return jsonify({'message': 'Notification marked as read'}), 200
        
    # File upload handling (local fallback for Cloudinary)
    @app.route('/api/upload', methods=['POST'])
    def upload_file():
        if 'image' not in request.files:
            return jsonify({'message': 'No image part'}), 400
        file = request.files['image']
        if file.filename == '':
            return jsonify({'message': 'No selected image'}), 400
            
        if file:
            filename = secure_filename(file.filename)
            # Add timestamp to filename to prevent duplicates
            import time
            unique_filename = f"{int(time.time())}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
            
            # Return server relative URL path
            image_url = f"http://localhost:5000/api/uploads/{unique_filename}"
            return jsonify({'message': 'File uploaded successfully', 'url': image_url}), 200
            
    # Serve uploaded files
    @app.route('/api/uploads/<filename>', methods=['GET'])
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        
    # Health check
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy'}), 200
        
    # Database auto-creation inside application context
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    # Run development server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
