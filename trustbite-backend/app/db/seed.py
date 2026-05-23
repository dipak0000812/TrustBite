# app/db/seed.py

import os
import random
from decimal import Decimal
from datetime import datetime, timedelta

from app.db.database import SessionLocal
from app.models import User, Mess, MenuItem, Review, Favourite
from app.core.security import hash_password
from app.services.trust_score import calculate_trust_score


# ── Environment Guard ──────────────────────────────────────────────────────────

def _confirm_environment():
    """
    Hard stop if running in production.
    Requires explicit opt-in for any other environment.
    This function must be called before ANY destructive DB operation.
    """
    env = os.getenv("ENVIRONMENT", "").lower().strip()

    # Absolute hard block — never seed production
    if env == "production":
        print("ERROR: seed.py cannot run in ENVIRONMENT=production.")
        print("This script destroys all data. It is for development only.")
        raise SystemExit(1)

    # Warn clearly in any environment
    print("=" * 60)
    print("  WARNING: This will DELETE ALL DATA in the database.")
    print(f"  Current ENVIRONMENT = '{env or 'not set'}'")
    print("=" * 60)
    confirmation = input("  Type 'yes' to confirm: ").strip().lower()

    if confirmation != "yes":
        print("Seed cancelled. No data was changed.")
        raise SystemExit(0)


# ── Seed Data Definitions ──────────────────────────────────────────────────────

DEMO_USERS = [
    {
        "full_name": "Vikram Admin",
        "email": "admin@trustbite.in",
        "password_hash": hash_password("Admin@123"),
        "role": "admin",
        "is_onboarding_complete": True,
    },
    {
        "full_name": "Ramesh Patil",
        "email": "ramesh@owner.in",
        "password_hash": hash_password("Owner@123"),
        "role": "mess_owner",
        "phone": "9876543210",
        "is_onboarding_complete": True,
    },
    {
        "full_name": "Sunita Devi",
        "email": "sunita@owner.in",
        "password_hash": hash_password("Owner@123"),
        "role": "mess_owner",
        "phone": "9123456780",
        "is_onboarding_complete": True,
    },
    {
        "full_name": "Krishnamurthy R",
        "email": "krishna@owner.in",
        "password_hash": hash_password("Owner@123"),
        "role": "mess_owner",
        "phone": "9988776655",
        "is_onboarding_complete": True,
    },
    {
        "full_name": "Aryan Mehta",
        "email": "student@trustbite.in",
        "password_hash": hash_password("Student@123"),
        "role": "student",
        "college_name": "MIT Pune",
        "is_onboarding_complete": True,   # ← was missing before
    },
    {
        "full_name": "Priya Nair",
        "email": "priya@student.in",
        "password_hash": hash_password("Student@123"),
        "role": "student",
        "college_name": "Symbiosis Pune",
        "is_onboarding_complete": True,
    },
    {
        "full_name": "Rohit Sharma",
        "email": "rohit@student.in",
        "password_hash": hash_password("Student@123"),
        "role": "student",
        "college_name": "VIT Pune",
        "is_onboarding_complete": True,
    },
    {
        "full_name": "Sneha Kulkarni",
        "email": "sneha@student.in",
        "password_hash": hash_password("Student@123"),
        "role": "student",
        "college_name": "COEP Pune",
        "is_onboarding_complete": True,
    },
]


# NOTE: No trust_score or avg_rating here.
# These are calculated by the system after reviews are seeded.
# hygiene_score is the only manually set field — because it represents
# a physical inspection result, not something derived from reviews.
DEMO_MESSES = [
    {
        "name": "Shree Sai Mess",
        "description": "Authentic Maharashtrian home-style thali since 2010. Every meal prepared fresh with no preservatives. Our dal is slow-cooked for 3 hours every morning.",
        "address": "Lane 4, Near Symbiosis Gate 2, Viman Nagar",
        "city": "Pune", "pincode": "411014",
        "latitude": Decimal("18.562130"), "longitude": Decimal("73.914650"),
        "cuisine_type": "maharashtrian", "price_per_meal": Decimal("80.00"),
        "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("9.2"),
        "is_fssai_verified": True, "fssai_license": "10020042002543",
        "owner_email": "ramesh@owner.in",
    },
    {
        "name": "Annapoorna Bhojanalay",
        "description": "Pure South Indian vegetarian meals. Filter coffee made fresh every hour. Our sambar recipe has been in the family for 3 generations.",
        "address": "Shop 7, Kothrud Housing Society, Kothrud",
        "city": "Pune", "pincode": "411038",
        "latitude": Decimal("18.504950"), "longitude": Decimal("73.820640"),
        "cuisine_type": "south_indian", "price_per_meal": Decimal("65.00"),
        "is_veg": True, "serves_breakfast": True, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("8.8"),
        "is_fssai_verified": True, "fssai_license": "10020042009871",
        "owner_email": "sunita@owner.in",
    },
    {
        "name": "Punjabi Dhaba Express",
        "description": "Hearty North Indian food for the hungry student. Dal Makhani simmers overnight. Our butter chicken is made with real cream and no food colour.",
        "address": "Ground Floor, Pinnacle Tower, Baner Road",
        "city": "Pune", "pincode": "411045",
        "latitude": Decimal("18.559380"), "longitude": Decimal("73.779560"),
        "cuisine_type": "north_indian", "price_per_meal": Decimal("95.00"),
        "is_veg": False, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("9.5"),
        "is_fssai_verified": True, "fssai_license": "10020042001122",
        "owner_email": "ramesh@owner.in",
    },
    {
        "name": "Saurabh Home Food",
        "description": "Gujarati thali with unlimited refills. Jain options available on request. Pure ghee used in all preparations.",
        "address": "Row House 12, Hadapsar Industrial Estate",
        "city": "Pune", "pincode": "411013",
        "latitude": Decimal("18.496720"), "longitude": Decimal("73.930450"),
        "cuisine_type": "gujarati", "price_per_meal": Decimal("70.00"),
        "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": False,
        "hygiene_score": Decimal("7.9"),
        "is_fssai_verified": False,
        "owner_email": "sunita@owner.in",
    },
    {
        "name": "Sri Venkatesh Mess",
        "description": "Traditional Andhra and Tamil Nadu meals. Rice served unlimited. Our rasam is the most requested dish by students who've been here.",
        "address": "Near Pimpri Station, Shop 3, PCMC Road",
        "city": "Pune", "pincode": "411018",
        "latitude": Decimal("18.627810"), "longitude": Decimal("73.800290"),
        "cuisine_type": "south_indian", "price_per_meal": Decimal("75.00"),
        "is_veg": True, "serves_breakfast": True, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("9.0"),
        "is_fssai_verified": True, "fssai_license": "10020042007788",
        "owner_email": "krishna@owner.in",
    },
    {
        "name": "Raj Shree Bhojanalay",
        "description": "Rajasthani cuisine in the heart of Wakad. Dal Baati Churma prepared in traditional wood-fire style every Sunday.",
        "address": "Opposite Xion Mall, Wakad",
        "city": "Pune", "pincode": "411057",
        "latitude": Decimal("18.591200"), "longitude": Decimal("73.760300"),
        "cuisine_type": "rajasthani", "price_per_meal": Decimal("85.00"),
        "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("8.5"),
        "is_fssai_verified": False,
        "owner_email": "krishna@owner.in",
    },
    {
        "name": "Campus Bites",
        "description": "Multi-cuisine mess designed for college students. Rotating weekly menu so you never eat the same thing twice. Affordable subscriptions available.",
        "address": "FC Road, Behind Ferguson College",
        "city": "Pune", "pincode": "411004",
        "latitude": Decimal("18.519500"), "longitude": Decimal("73.841200"),
        "cuisine_type": "multi_cuisine", "price_per_meal": Decimal("60.00"),
        "is_veg": False, "serves_breakfast": True, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("8.2"),
        "is_fssai_verified": False,
        "owner_email": "sunita@owner.in",
    },
    {
        "name": "Grihini Kitchen",
        "description": "Run by a group of homemakers. Every dish is made exactly like home. Monthly subscription gives you the best value in Kharadi.",
        "address": "Building C, EON IT Park Road, Kharadi",
        "city": "Pune", "pincode": "411014",
        "latitude": Decimal("18.551100"), "longitude": Decimal("73.943200"),
        "cuisine_type": "maharashtrian", "price_per_meal": Decimal("72.00"),
        "is_veg": True, "serves_breakfast": False, "serves_lunch": True, "serves_dinner": True,
        "hygiene_score": Decimal("9.3"),
        "is_fssai_verified": True, "fssai_license": "10020042005566",
        "owner_email": "ramesh@owner.in",
    },
]

REVIEW_TEXTS = [
    "Amazing food, tasted just like my mom's cooking!",
    "Decent portions for the price.",
    "Loved the special Sunday thali. A must-try.",
    "Hygiene is top notch. The staff is polite.",
    "Can get a bit crowded during lunch hour, but food is solid.",
    "Their dal is incredibly flavorful.",
    "Good option for daily subscription.",
    "Been eating here for 3 months, zero complaints.",
]


# ── Main Seed Function ─────────────────────────────────────────────────────────

def seed():
    # Step 1: Environment check BEFORE opening any DB connection
    _confirm_environment()

    db = SessionLocal()
    try:
        _clear_all(db)
        inserted_users = _seed_users(db)
        inserted_messes = _seed_messes(db, inserted_users)
        _seed_menu_items(db, inserted_messes)
        _seed_reviews(db, inserted_messes, inserted_users)
        _seed_favourites(db, inserted_messes, inserted_users)

        # Step 2: Recalculate ALL trust scores from actual seeded reviews
        # This ensures scores match the formula — never hardcoded
        print("Recalculating trust scores from seeded reviews...")
        _recalculate_all_trust_scores(db, inserted_messes)

        print("\nSeed completed successfully.")
        print(f"  Users:   {len(inserted_users)}")
        print(f"  Messes:  {len(inserted_messes)}")

    except Exception as e:
        db.rollback()
        print(f"\nSeed failed: {e}")
        raise
    finally:
        db.close()


# ── Private Helpers ────────────────────────────────────────────────────────────

def _clear_all(db):
    """Delete all data in correct FK order."""
    print("Clearing existing data...")
    db.query(Favourite).delete()
    db.query(Review).delete()
    db.query(MenuItem).delete()
    db.query(Mess).delete()
    db.query(User).delete()
    db.commit()


def _seed_users(db) -> dict:
    print("Seeding users...")
    inserted = {}
    for u_data in DEMO_USERS:
        user = User(**u_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        inserted[user.email] = user
    return inserted


def _seed_messes(db, inserted_users: dict) -> list:
    print("Seeding messes...")
    inserted = []
    for m_data in DEMO_MESSES:
        data = m_data.copy()
        owner_email = data.pop("owner_email")
        data["owner_id"] = inserted_users[owner_email].id
        # avg_rating and trust_score start at 0
        # They get recalculated after reviews are seeded
        data["avg_rating"] = Decimal("0.0")
        data["trust_score"] = Decimal("0.0")
        mess = Mess(**data)
        db.add(mess)
        db.commit()
        db.refresh(mess)
        inserted.append(mess)
    return inserted


def _seed_menu_items(db, inserted_messes: list):
    print("Seeding menu items...")
    items = []
    for mess in inserted_messes:
        price = mess.price_per_meal
        if mess.serves_breakfast:
            items.extend([
                MenuItem(mess_id=mess.id, name="Idli Sambar (4 pcs)", meal_type="breakfast",
                         description="Served hot with coconut chutney", price=Decimal("40.00"), is_veg=True, calories=320),
                MenuItem(mess_id=mess.id, name="Poha with Jalebi", meal_type="breakfast",
                         description="Classic morning combo", price=Decimal("35.00"), is_veg=True, calories=450),
                MenuItem(mess_id=mess.id, name="Bread Omelette / Upma", meal_type="breakfast",
                         description="Quick fast-breaker", price=Decimal("30.00"), is_veg=not mess.is_veg, calories=380),
            ])
        if mess.serves_lunch:
            items.extend([
                MenuItem(mess_id=mess.id, name="Full Thali / Meals", meal_type="lunch",
                         description="Standard unlimited lunch", price=price, is_veg=mess.is_veg, calories=850),
                MenuItem(mess_id=mess.id, name="Half Thali", meal_type="lunch",
                         description="Lighter lunch option", price=price - Decimal("20.00"), is_veg=mess.is_veg, calories=500),
                MenuItem(mess_id=mess.id, name="Special Sunday Thali", meal_type="lunch",
                         description="Includes sweet and extra items", price=price + Decimal("20.00"),
                         day_of_week=6, is_veg=mess.is_veg, calories=1100),
            ])
        if mess.serves_dinner:
            items.extend([
                MenuItem(mess_id=mess.id, name="Dinner Thali", meal_type="dinner",
                         description="Standard satisfying dinner", price=price - Decimal("10.00"), is_veg=mess.is_veg, calories=780),
                MenuItem(mess_id=mess.id, name="Khichdi + Kadhi", meal_type="dinner",
                         description="Comfort food for a light stomach", price=Decimal("50.00"),
                         day_of_week=2, is_veg=True, calories=600),
            ])
    db.add_all(items)
    db.commit()


def _seed_reviews(db, inserted_messes: list, inserted_users: dict):
    print("Seeding reviews...")
    students = [u for u in inserted_users.values() if u.role == "student"]
    reviews = []

    for mess in inserted_messes:
        num_reviews = random.randint(2, 4)
        reviewers = random.sample(students, min(num_reviews, len(students)))
        for student in reviewers:
            reviews.append(Review(
                mess_id=mess.id,
                student_id=student.id,
                rating=random.randint(4, 5),
                hygiene_rating=random.randint(3, 5),
                comment=random.choice(REVIEW_TEXTS),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
            ))

    # Ensure demo student has visible reviews
    aryan = inserted_users["student@trustbite.in"]
    for mess in inserted_messes[:3]:
        if not any(r.mess_id == mess.id and r.student_id == aryan.id for r in reviews):
            reviews.append(Review(
                mess_id=mess.id,
                student_id=aryan.id,
                rating=5,
                hygiene_rating=5,
                comment="Absolutely incredible. Highly recommend this place!",
                created_at=datetime.utcnow() - timedelta(days=2),
            ))

    db.add_all(reviews)
    db.commit()


def _seed_favourites(db, inserted_messes: list, inserted_users: dict):
    print("Seeding favourites...")
    students = [u for u in inserted_users.values() if u.role == "student"]
    aryan = inserted_users["student@trustbite.in"]
    favourites = []

    for mess in inserted_messes[:4]:
        favourites.append(Favourite(student_id=aryan.id, mess_id=mess.id))

    for student in students:
        if student.id == aryan.id:
            continue
        for mess in random.sample(inserted_messes, random.randint(1, 3)):
            favourites.append(Favourite(student_id=student.id, mess_id=mess.id))

    db.add_all(favourites)
    db.commit()


def _recalculate_all_trust_scores(db, inserted_messes: list):
    """
    After reviews are seeded, recalculate trust scores using the real formula.
    This ensures seeded scores always match whatever calculate_trust_score() returns.
    If the formula changes tomorrow, just re-seed — scores will be correct.
    """
    from sqlalchemy import func
    from app.models.review import Review as ReviewModel

    for mess in inserted_messes:
        agg = db.query(
            func.avg(ReviewModel.rating),
            func.count(ReviewModel.id)
        ).filter(
            ReviewModel.mess_id == mess.id,
            ReviewModel.is_active == True,
        ).first()

        avg_rating = round(float(agg[0] or 0), 1)
        total_reviews = int(agg[1] or 0)

        mess.avg_rating = Decimal(str(avg_rating))
        mess.total_reviews = total_reviews
        mess.trust_score = Decimal(str(calculate_trust_score(
            avg_rating=avg_rating,
            hygiene_score=float(mess.hygiene_score or 0),
            total_reviews=total_reviews,
            is_fssai_verified=bool(mess.is_fssai_verified),
        )))

    db.commit()
    print("Trust scores recalculated.")


if __name__ == '__main__':
    seed()