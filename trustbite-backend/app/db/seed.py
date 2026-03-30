import random
from decimal import Decimal
from datetime import datetime, timedelta
from app.db.database import SessionLocal
from app.models import User, Mess, MenuItem, Review, Favourite
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    try:
        # Clear existing data just in case
        db.query(Favourite).delete()
        db.query(Review).delete()
        db.query(MenuItem).delete()
        db.query(Mess).delete()
        db.query(User).delete()
        db.commit()

        # ── Users ──────────────────────────────────────────────────
        print("Seeding Users...")
        DEMO_USERS = [
            # Admin
            { "full_name": "Vikram Admin", "email": "admin@trustbite.in", 
              "password_hash": hash_password("Admin@123"), "role": "admin" },
        
            # Mess Owners
            { "full_name": "Ramesh Patil", "email": "ramesh@owner.in", 
              "password_hash": hash_password("Owner@123"), "role": "mess_owner", "phone": "9876543210" },
            { "full_name": "Sunita Devi", "email": "sunita@owner.in", 
              "password_hash": hash_password("Owner@123"), "role": "mess_owner", "phone": "9123456780" },
            { "full_name": "Krishnamurthy R", "email": "krishna@owner.in", 
              "password_hash": hash_password("Owner@123"), "role": "mess_owner", "phone": "9988776655" },
        
            # Students (demo login: student@trustbite.in / Student@123)
            { "full_name": "Aryan Mehta", "email": "student@trustbite.in", 
              "password_hash": hash_password("Student@123"), "role": "student", "college_name": "MIT Pune" },
            { "full_name": "Priya Nair", "email": "priya@student.in", 
              "password_hash": hash_password("Student@123"), "role": "student", "college_name": "Symbiosis Pune" },
            { "full_name": "Rohit Sharma", "email": "rohit@student.in", 
              "password_hash": hash_password("Student@123"), "role": "student", "college_name": "VIT Pune" },
            { "full_name": "Sneha Kulkarni", "email": "sneha@student.in", 
              "password_hash": hash_password("Student@123"), "role": "student", "college_name": "COEP Pune" },
        ]

        inserted_users = {}
        for u_data in DEMO_USERS:
            user = User(**u_data)
            db.add(user)
            db.commit()
            db.refresh(user)
            inserted_users[user.email] = user

        # ── Messes ─────────────────────────────────────────────────
        print("Seeding Messes...")
        DEMO_MESSES = [
            {
                "name": "Shree Sai Mess", 
                "description": "Authentic Maharashtrian home-style thali since 2010. Every meal prepared fresh with no preservatives. Our dal is slow-cooked for 3 hours every morning.",
                "address": "Lane 4, Near Symbiosis Gate 2, Viman Nagar", 
                "city": "Pune", "pincode": "411014",
                "latitude": Decimal("18.562130"), "longitude": Decimal("73.914650"),
                "cuisine_type": "maharashtrian", "price_per_meal": Decimal("80.00"),
                "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("9.2"), "trust_score": Decimal("9.1"), "avg_rating": Decimal("4.7"), "total_reviews": 312,
                "is_fssai_verified": True, "fssai_license": "10020042002543",
                "owner_email": "ramesh@owner.in"
            },
            {
                "name": "Annapoorna Bhojanalay",
                "description": "Pure South Indian vegetarian meals. Filter coffee made fresh every hour. Our sambar recipe has been in the family for 3 generations.",
                "address": "Shop 7, Kothrud Housing Society, Kothrud",
                "city": "Pune", "pincode": "411038",
                "latitude": Decimal("18.504950"), "longitude": Decimal("73.820640"),
                "cuisine_type": "south_indian", "price_per_meal": Decimal("65.00"),
                "is_veg": True, "serves_breakfast": True, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("8.8"), "trust_score": Decimal("8.7"), "avg_rating": Decimal("4.5"), "total_reviews": 198,
                "is_fssai_verified": True, "fssai_license": "10020042009871",
                "owner_email": "sunita@owner.in"
            },
            {
                "name": "Punjabi Dhaba Express",
                "description": "Hearty North Indian food for the hungry student. Dal Makhani simmers overnight. Our butter chicken is made with real cream and no food colour.",
                "address": "Ground Floor, Pinnacle Tower, Baner Road",
                "city": "Pune", "pincode": "411045",
                "latitude": Decimal("18.559380"), "longitude": Decimal("73.779560"),
                "cuisine_type": "north_indian", "price_per_meal": Decimal("95.00"),
                "is_veg": False, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("9.5"), "trust_score": Decimal("9.4"), "avg_rating": Decimal("4.9"), "total_reviews": 445,
                "is_fssai_verified": True, "fssai_license": "10020042001122",
                "owner_email": "ramesh@owner.in"
            },
            {
                "name": "Saurabh Home Food",
                "description": "Gujarati thali with unlimited refills. Jain options available on request. Pure ghee used in all preparations.",
                "address": "Row House 12, Hadapsar Industrial Estate",
                "city": "Pune", "pincode": "411013",
                "latitude": Decimal("18.496720"), "longitude": Decimal("73.930450"),
                "cuisine_type": "gujarati", "price_per_meal": Decimal("70.00"),
                "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": False,
                "hygiene_score": Decimal("7.9"), "trust_score": Decimal("7.8"), "avg_rating": Decimal("4.3"), "total_reviews": 87,
                "is_fssai_verified": False,
                "owner_email": "sunita@owner.in"
            },
            {
                "name": "Sri Venkatesh Mess",
                "description": "Traditional Andhra and Tamil Nadu meals. Rice served unlimited. Our rasam is the most requested dish by students who've been here.",
                "address": "Near Pimpri Station, Shop 3, PCMC Road",
                "city": "Pune", "pincode": "411018",
                "latitude": Decimal("18.627810"), "longitude": Decimal("73.800290"),
                "cuisine_type": "south_indian", "price_per_meal": Decimal("75.00"),
                "is_veg": True, "serves_breakfast": True, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("9.0"), "trust_score": Decimal("8.9"), "avg_rating": Decimal("4.6"), "total_reviews": 221,
                "is_fssai_verified": True, "fssai_license": "10020042007788",
                "owner_email": "krishna@owner.in"
            },
            {
                "name": "Raj Shree Bhojanalay",
                "description": "Rajasthani cuisine in the heart of Wakad. Dal Baati Churma prepared in traditional wood-fire style every Sunday.",
                "address": "Opposite Xion Mall, Wakad",
                "city": "Pune", "pincode": "411057",
                "latitude": Decimal("18.591200"), "longitude": Decimal("73.760300"),
                "cuisine_type": "rajasthani", "price_per_meal": Decimal("85.00"),
                "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("8.5"), "trust_score": Decimal("8.4"), "avg_rating": Decimal("4.4"), "total_reviews": 134,
                "is_fssai_verified": False,
                "owner_email": "krishna@owner.in"
            },
            {
                "name": "Campus Bites",
                "description": "Multi-cuisine mess designed for college students. Rotating weekly menu so you never eat the same thing twice. Affordable subscriptions available.",
                "address": "FC Road, Behind Ferguson College",
                "city": "Pune", "pincode": "411004",
                "latitude": Decimal("18.519500"), "longitude": Decimal("73.841200"),
                "cuisine_type": "multi_cuisine", "price_per_meal": Decimal("60.00"),
                "is_veg": False, "serves_breakfast": True, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("8.2"), "trust_score": Decimal("8.0"), "avg_rating": Decimal("4.2"), "total_reviews": 76,
                "is_fssai_verified": False,
                "owner_email": "sunita@owner.in"
            },
            {
                "name": "Grihini Kitchen",
                "description": "Run by a group of homemakers. Every dish is made exactly like home. Monthly subscription gives you the best value in Kharadi.",
                "address": "Building C, EON IT Park Road, Kharadi",
                "city": "Pune", "pincode": "411014",
                "latitude": Decimal("18.551100"), "longitude": Decimal("73.943200"),
                "cuisine_type": "maharashtrian", "price_per_meal": Decimal("72.00"),
                "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
                "hygiene_score": Decimal("9.3"), "trust_score": Decimal("9.2"), "avg_rating": Decimal("4.8"), "total_reviews": 189,
                "is_fssai_verified": True, "fssai_license": "10020042005566",
                "owner_email": "ramesh@owner.in"
            },
        ]

        inserted_messes = []
        for m_data in DEMO_MESSES:
            owner_email = m_data.pop("owner_email")
            m_data["owner_id"] = inserted_users[owner_email].id
            mess = Mess(**m_data)
            db.add(mess)
            db.commit()
            db.refresh(mess)
            inserted_messes.append(mess)

        # ── Menu Items ─────────────────────────────────────────────
        print("Seeding Menu Items...")
        menu_items_to_add = []
        for mess in inserted_messes:
            price = mess.price_per_meal
            if mess.serves_breakfast:
                menu_items_to_add.extend([
                    MenuItem(mess_id=mess.id, name="Idli Sambar (4 pcs)", meal_type="breakfast", description="Served hot with coconut chutney", price=Decimal("40.00"), is_veg=True, calories=320),
                    MenuItem(mess_id=mess.id, name="Poha with Jalebi", meal_type="breakfast", description="Classic morning combo", price=Decimal("35.00"), is_veg=True, calories=450),
                    MenuItem(mess_id=mess.id, name="Bread Omelette / Upma", meal_type="breakfast", description="Quick fast-breaker", price=Decimal("30.00"), is_veg=not mess.is_veg, calories=380)
                ])
            if mess.serves_lunch:
                menu_items_to_add.extend([
                    MenuItem(mess_id=mess.id, name="Full Thali / Meals", meal_type="lunch", description="Standard unlimited lunch", price=price, is_veg=mess.is_veg, calories=850),
                    MenuItem(mess_id=mess.id, name="Half Thali", meal_type="lunch", description="Lighter lunch option", price=price - Decimal("20.00"), is_veg=mess.is_veg, calories=500),
                    MenuItem(mess_id=mess.id, name="Special Sunday Thali", meal_type="lunch", description="Includes sweet and extra items", price=price + Decimal("20.00"), day_of_week=6, is_veg=mess.is_veg, calories=1100),
                ])
            if mess.serves_dinner:
                menu_items_to_add.extend([
                    MenuItem(mess_id=mess.id, name="Dinner Thali", meal_type="dinner", description="Standard satisfying dinner", price=price - Decimal("10.00"), is_veg=mess.is_veg, calories=780),
                    MenuItem(mess_id=mess.id, name="Khichdi + Kadhi", meal_type="dinner", description="Comfort food for a light stomach", price=Decimal("50.00"), day_of_week=2, is_veg=True, calories=600),
                ])
        
        db.add_all(menu_items_to_add)
        db.commit()

        # ── Reviews ────────────────────────────────────────────────
        print("Seeding Reviews...")
        review_texts = [
            "Amazing food, tasted just like my mom's cooking!",
            "Decent portions for the price.",
            "Loved the special Sunday thali. A must-try.",
            "Hygiene is top notch. The staff is polite.",
            "Can get a bit crowded during lunch hour, but food is solid.",
            "Their dal is incredibly flavorful.",
            "Good option for daily subscription.",
            "Been eating here for 3 months, zero complaints."
        ]
        
        students = [u for u in inserted_users.values() if u.role == "student"]
        reviews_to_add = []
        for mess in inserted_messes:
            # Add 2-4 reviews per mess
            num_reviews = random.randint(2, 4)
            reviewers = random.sample(students, min(num_reviews, len(students)))
            for student in reviewers:
                reviews_to_add.append(Review(
                    mess_id=mess.id,
                    student_id=student.id,
                    rating=random.randint(4, 5),
                    hygiene_rating=random.randint(3, 5),
                    comment=random.choice(review_texts),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
                ))
        
        # Ensure 'student@trustbite.in' has specific reviews so the profile looks full
        aryan = inserted_users["student@trustbite.in"]
        # Add a couple specific reviews from Aryan if not already present
        for mess in inserted_messes[:3]:  # Review first 3 messes
            if not any(r.mess_id == mess.id and r.student_id == aryan.id for r in reviews_to_add):
                reviews_to_add.append(Review(
                    mess_id=mess.id,
                    student_id=aryan.id,
                    rating=5,
                    hygiene_rating=5,
                    comment="Absolutely incredible. Highly recommend this place!",
                    created_at=datetime.utcnow() - timedelta(days=2)
                ))

        db.add_all(reviews_to_add)
        db.commit()

        # ── Favourites ─────────────────────────────────────────────
        print("Seeding Favourites...")
        favourites_to_add = []
        # Aryan favours 4 messes
        aryan_favs = inserted_messes[0:4]
        for mess in aryan_favs:
            favourites_to_add.append(Favourite(student_id=aryan.id, mess_id=mess.id))
        
        # Other students favour some messes randomly
        for student in students:
            if student.id == aryan.id:
                continue
            num_favs = random.randint(1, 3)
            fav_messes = random.sample(inserted_messes, num_favs)
            for mess in fav_messes:
                favourites_to_add.append(Favourite(student_id=student.id, mess_id=mess.id))

        db.add_all(favourites_to_add)
        db.commit()

        print("Seed data inserted successfully.")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == '__main__':
    seed()
