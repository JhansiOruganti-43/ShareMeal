import os
from datetime import datetime, timedelta
from app import create_app
from models import db, User, RestaurantProfile, NGOProfile, Donation, Claim, Rating, Notification

def seed_database():
    app = create_app()
    with app.app_context():
        # Clear existing data if requested or if empty
        if User.query.first():
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding database...")

        # 1. Create Admin
        admin = User(
            email='admin@sharemeal.org',
            role='admin',
            name='ShareMeal Admin',
            phone='+91 99999 88888',
            address='Administrative HQ, Hyderabad',
            status='verified'
        )
        admin.set_password('admin123')
        db.session.add(admin)

        # 2. Create Restaurants
        rest1 = User(
            email='grand_bistro@restaurant.com',
            role='restaurant',
            name='Grand Bistro',
            phone='+91 98765 43210',
            address='Madhapur, Hyderabad',
            latitude=17.4483,
            longitude=78.3915,
            status='verified'
        )
        rest1.set_password('restaurant123')
        db.session.add(rest1)
        db.session.flush()

        rest_prof1 = RestaurantProfile(
            user_id=rest1.id,
            license_number='LIC-8827-BI',
            description='A premium fine dining restaurant specializing in authentic Indian and continental cuisine.',
            badge_points=240,
            rating=4.8
        )
        db.session.add(rest_prof1)

        rest2 = User(
            email='delight_bakery@restaurant.com',
            role='restaurant',
            name='Delight Bakery',
            phone='+91 91234 56789',
            address='Kondapur, Hyderabad',
            latitude=17.4622,
            longitude=78.3568,
            status='verified'
        )
        rest2.set_password('restaurant123')
        db.session.add(rest2)
        db.session.flush()

        rest_prof2 = RestaurantProfile(
            user_id=rest2.id,
            license_number='LIC-1192-DK',
            description='Daily fresh bread, cakes, pastries and baked goods.',
            badge_points=120,
            rating=4.5
        )
        db.session.add(rest_prof2)

        # Pending Restaurant (for Admin verification testing)
        rest_pending = User(
            email='spicy_house@restaurant.com',
            role='restaurant',
            name='Spicy House Restaurant',
            phone='+91 98888 77777',
            address='Begumpet, Hyderabad',
            latitude=17.4375,
            longitude=78.4482,
            status='pending'
        )
        rest_pending.set_password('restaurant123')
        db.session.add(rest_pending)
        db.session.flush()
        
        rest_prof_pending = RestaurantProfile(
            user_id=rest_pending.id,
            license_number='LIC-9912-SP',
            description='Traditional spicy Mughlai food.'
        )
        db.session.add(rest_prof_pending)

        # 3. Create NGOs
        ngo1 = User(
            email='hope_foundation@ngo.org',
            role='ngo',
            name='Hope Foundation',
            phone='+91 88888 11111',
            address='Gachibowli, Hyderabad',
            latitude=17.4401,
            longitude=78.3489,
            status='verified'
        )
        ngo1.set_password('ngo123')
        db.session.add(ngo1)
        db.session.flush()

        ngo_prof1 = NGOProfile(
            user_id=ngo1.id,
            registration_number='REG-9912-HP',
            description='Working to eliminate food waste and distribute surplus meals to shelter homes.'
        )
        db.session.add(ngo_prof1)

        ngo2 = User(
            email='feed_all@ngo.org',
            role='ngo',
            name='Feed All NGO',
            phone='+91 77777 22222',
            address='Jubilee Hills, Hyderabad',
            latitude=17.4312,
            longitude=78.4014,
            status='verified'
        )
        ngo2.set_password('ngo123')
        db.session.add(ngo2)
        db.session.flush()

        ngo_prof2 = NGOProfile(
            user_id=ngo2.id,
            registration_number='REG-1209-FA',
            description='Redistributes meals across street side communities and slums.'
        )
        db.session.add(ngo_prof2)

        # Pending NGO (for Admin verification testing)
        ngo_pending = User(
            email='care_share@ngo.org',
            role='ngo',
            name='Care & Share Foundation',
            phone='+91 77777 88888',
            address='Ameerpet, Hyderabad',
            latitude=17.4374,
            longitude=78.4336,
            status='pending'
        )
        ngo_pending.set_password('ngo123')
        db.session.add(ngo_pending)
        db.session.flush()
        
        ngo_prof_pending = NGOProfile(
            user_id=ngo_pending.id,
            registration_number='REG-4412-CS',
            description='Providing nutritional meals to children.'
        )
        db.session.add(ngo_prof_pending)

        # 4. Create active donations
        now = datetime.utcnow()
        
        don_active1 = Donation(
            restaurant_id=rest1.id,
            title='Buffet Rice & Chicken Curry',
            description='Surplus food from afternoon corporate buffet. Kept under refrigeration.',
            food_type='non-veg',
            quantity=30,  # 30 servings
            weight_kg=12.0,
            status='available',
            expiry_time=now + timedelta(hours=6),
            created_at=now - timedelta(minutes=30),
            co2_saved=30.0
        )
        db.session.add(don_active1)

        don_active2 = Donation(
            restaurant_id=rest2.id,
            title='Fresh Whole Wheat Bread & Buns',
            description='Remaining bake batch from today. Fresh and packed in plastic bags.',
            food_type='veg',
            quantity=20,
            weight_kg=8.0,
            status='available',
            expiry_time=now + timedelta(hours=18),
            created_at=now - timedelta(hours=1),
            co2_saved=20.0
        )
        db.session.add(don_active2)

        # 5. Create historical completed donations & claims for monthly analytics charts
        # Month offsets (June, May, April, March, February, January)
        months_offsets = [0, 1, 2, 3, 4, 5]
        weights = [45.0, 52.0, 38.0, 42.0, 29.0, 25.0]  # Weight in KG
        servings = [110, 130, 95, 105, 72, 60]

        for i, offset in enumerate(months_offsets):
            time_created = now - timedelta(days=30 * offset + 5)
            
            # Grand Bistro completed donation
            don_hist = Donation(
                restaurant_id=rest1.id,
                title=f'Veg Biryani & Salan Batch - Offset {offset}',
                description='Surplus batch from dinner buffet.',
                food_type='veg',
                quantity=servings[i],
                weight_kg=weights[i],
                status='completed',
                expiry_time=time_created + timedelta(hours=10),
                created_at=time_created,
                co2_saved=weights[i] * 2.5
            )
            db.session.add(don_hist)
            db.session.flush()

            # Claim
            claim_hist = Claim(
                donation_id=don_hist.id,
                ngo_id=ngo1.id if offset % 2 == 0 else ngo2.id,
                claimed_at=time_created + timedelta(minutes=15),
                status='completed',
                pickup_time=time_created + timedelta(hours=1),
                qr_code_hash=f'SEEDCLAIM{offset}'
            )
            db.session.add(claim_hist)
            db.session.flush()

            # Rating
            rating_hist = Rating(
                claim_id=claim_hist.id,
                rated_by=claim_hist.ngo_id,
                rated_for=rest1.id,
                score=5 if offset % 2 == 0 else 4,
                comment='Great quality packaging and quick pickup assistance!',
                created_at=time_created + timedelta(hours=2)
            )
            db.session.add(rating_hist)

        # 6. Notifications seed
        notif1 = Notification(
            user_id=ngo1.id,
            message="Welcome to ShareMeal! Your account has been verified by the administrator.",
            type='info',
            is_read=True
        )
        notif2 = Notification(
            user_id=rest1.id,
            message="Your account verification is complete. Start posting donations!",
            type='info',
            is_read=True
        )
        db.session.add(notif1)
        db.session.add(notif2)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
