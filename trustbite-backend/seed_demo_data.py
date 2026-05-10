import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.models.mess import Mess
from app.models.review import Review
from app.models.menu_item import MenuItem
from app.models.favourite import Favourite
from app.core.security import hash_password

def seed_data():
    db: Session = SessionLocal()
    
    print("Clearing existing data...")
    # Clear tables in correct order to respect foreign keys
    db.execute(text("DELETE FROM favourites"))
    db.execute(text("DELETE FROM reviews"))
    db.execute(text("DELETE FROM menu_items"))
    db.execute(text("DELETE FROM messes"))
    db.execute(text("DELETE FROM users"))
    db.commit()
    
    print("Seeding demo users...")
    pwd_hash = hash_password("TrustBite@123")
    admin_pwd = hash_password("Admin@123")
    
    # 1. Admin
    admin = User(
        id=uuid.uuid4(),
        email="admin@trustbite.com",
        password_hash=admin_pwd,
        full_name="Platform Administrator",
        role="admin",
        is_active=True
    )
    db.add(admin)
    
    # 2. Mess Owners
    owners_data = [
        {"name": "Ramesh Kumar", "email": "ramesh@owner.com", "phone": "9876543210"},
        {"name": "Priya Sharma", "email": "priya@owner.com", "phone": "9822334455"},
        {"name": "Gurpreet Singh", "email": "gurpreet@owner.com", "phone": "9988776655"}
    ]
    owners = []
    for o in owners_data:
        user = User(
            id=uuid.uuid4(),
            email=o["email"],
            password_hash=hash_password("Owner@123"),
            full_name=o["name"],
            phone=o["phone"],
            role="mess_owner",
            is_active=True
        )
        db.add(user)
        owners.append(user)
        
    # 3. Students
    students_data = [
        {"name": "Aryan Mehta", "email": "aryan@student.com", "college": "COEP Technical University"},
        {"name": "Sneha Patil", "email": "sneha@student.com", "college": "Symbiosis Institute of Tech"},
        {"name": "Rahul Deshmukh", "email": "rahul@student.com", "college": "Pune Institute of Computer Tech"},
        {"name": "Ananya Iyer", "email": "ananya@student.com", "college": "VIT Pune"},
        {"name": "Siddharth Rao", "email": "sid@student.com", "college": "MIT World Peace University"}
    ]
    students = []
    for s in students_data:
        user = User(
            id=uuid.uuid4(),
            email=s["email"],
            password_hash=hash_password("Student@123"),
            full_name=s["name"],
            college_name=s["college"],
            role="student",
            is_active=True
        )
        db.add(user)
        students.append(user)

    db.commit()
    
    print("Seeding messes...")
    # Mess Definitions
    messes_data = [
        {
            "name": "Shree Sai Mess",
            "owner_idx": 0,
            "description": "Authentic Maharashtrian home-style meals. We focus on low-oil preparation and fresh vegetables sourced daily from local markets.",
            "address": "Lane 4, Near Symbiosis Gate 2, Viman Nagar",
            "city": "Pune",
            "pincode": "411014",
            "cuisine_type": "maharashtrian",
            "price_per_meal": Decimal("80.00"),
            "is_veg": True,
            "serves_breakfast": True,
            "serves_lunch": True,
            "serves_dinner": True,
            "hygiene_score": Decimal("9.1"),
            "trust_score": Decimal("9.2"),
            "is_fssai_verified": True,
            "tags": "Top Rated,Healthy,Student Favorite",
            "menu": [
                ("Puran Poli Thali", "Traditional thali with 2 poli, amti, and rice", "Lunch"),
                ("Misal Pav", "Spicy sprout curry with bread", "Breakfast")
            ]
        },
        {
            "name": "Punjabi Dhaba Express",
            "owner_idx": 2,
            "description": "Rich and flavorful North Indian cuisine. Our Special Thali is famous among students for its generous portions and authentic taste.",
            "address": "Ground Floor, Pinnacle Tower, Baner Road",
            "city": "Pune",
            "pincode": "411045",
            "cuisine_type": "north_indian",
            "price_per_meal": Decimal("95.00"),
            "is_veg": False,
            "serves_breakfast": False,
            "serves_lunch": True,
            "serves_dinner": True,
            "hygiene_score": Decimal("8.5"),
            "trust_score": Decimal("9.4"),
            "is_fssai_verified": True,
            "tags": "Spicy,Premium,Late Night",
            "menu": [
                ("Butter Chicken Combo", "Butter chicken with 2 naan and rice", "Dinner"),
                ("Dal Makhani Thali", "Rich dal makhani with paneer and roti", "Lunch")
            ]
        },
        {
            "name": "Annapoorna Bhojanalay",
            "owner_idx": 1,
            "description": "Traditional South Indian meals served on banana leaves. Simple, healthy, and extremely affordable for students on a budget.",
            "address": "Karve Nagar, Near Garware College",
            "city": "Pune",
            "pincode": "411004",
            "cuisine_type": "south_indian",
            "price_per_meal": Decimal("65.00"),
            "is_veg": True,
            "serves_breakfast": True,
            "serves_lunch": True,
            "serves_dinner": False,
            "hygiene_score": Decimal("8.9"),
            "trust_score": Decimal("8.7"),
            "is_fssai_verified": True,
            "tags": "Budget,Healthy,Verified",
            "menu": [
                ("Masala Dosa", "Crispy dosa with potato filling", "Breakfast"),
                ("Full Meals", "Rice, Sambar, Rasam, 2 Cootu, Curd", "Lunch")
            ]
        },
        {
            "name": "Jain Satvik Mess",
            "owner_idx": 0,
            "description": "Pure Jain food without onion, garlic, or root vegetables. Prepared with utmost care and spiritual purity.",
            "address": "Market Yard, Near Jain Mandir",
            "city": "Pune",
            "pincode": "411037",
            "cuisine_type": "gujarati",
            "price_per_meal": Decimal("75.00"),
            "is_veg": True,
            "serves_breakfast": False,
            "serves_lunch": True,
            "serves_dinner": True,
            "hygiene_score": Decimal("9.8"),
            "trust_score": Decimal("9.9"),
            "is_fssai_verified": True,
            "tags": "Jain,Pure Veg,Highly Trusted",
            "menu": [
                ("Satvik Thali", "Jain style curry, dal, rice, and phulka", "Lunch")
            ]
        },
        {
            "name": "Delhi Darbar Mess",
            "owner_idx": 2,
            "description": "Specializing in parathas and North Indian curries. Our menu changes daily to keep things interesting for students.",
            "address": "Hadapsar, MIDC Road, Near Magarpatta",
            "city": "Pune",
            "pincode": "411028",
            "cuisine_type": "north_indian",
            "price_per_meal": Decimal("90.00"),
            "is_veg": False,
            "serves_breakfast": True,
            "serves_lunch": True,
            "serves_dinner": True,
            "hygiene_score": Decimal("8.2"),
            "trust_score": Decimal("8.5"),
            "is_fssai_verified": False,
            "tags": "Variety,Late Night",
            "menu": [
                ("Aloo Paratha", "2 Parathas with curd and pickle", "Breakfast")
            ]
        },
        {
            "name": "Kerala Flavors",
            "owner_idx": 1,
            "description": "Experience the true taste of Kerala. Fish curry and red rice available on Wednesdays and Sundays.",
            "address": "Kharadi, Near Zensar IT Park",
            "city": "Pune",
            "pincode": "411014",
            "cuisine_type": "south_indian",
            "price_per_meal": Decimal("110.00"),
            "is_veg": False,
            "serves_breakfast": False,
            "serves_lunch": True,
            "serves_dinner": True,
            "hygiene_score": Decimal("8.8"),
            "trust_score": Decimal("9.0"),
            "is_fssai_verified": True,
            "tags": "Seafood,Verified,Premium",
            "menu": [
                ("Fish Curry Meal", "Authentic Kerala fish curry with red rice", "Lunch")
            ]
        }
    ]

    for m in messes_data:
        owner = owners[m["owner_idx"]]
        mess = Mess(
            id=uuid.uuid4(),
            owner_id=owner.id,
            owner_phone=owner.phone,
            name=m["name"],
            description=m["description"],
            address=m["address"],
            city=m["city"],
            pincode=m["pincode"],
            cuisine_type=m["cuisine_type"],
            price_per_meal=m["price_per_meal"],
            weekly_price=m["price_per_meal"] * Decimal("7"),
            monthly_price=m["price_per_meal"] * Decimal("28"),
            is_veg=m["is_veg"],
            serves_breakfast=m["serves_breakfast"],
            serves_lunch=m["serves_lunch"],
            serves_dinner=m["serves_dinner"],
            breakfast_time="7:30 AM - 10:00 AM" if m["serves_breakfast"] else None,
            lunch_time="12:30 PM - 3:00 PM" if m["serves_lunch"] else None,
            dinner_time="7:30 PM - 10:30 PM" if m["serves_dinner"] else None,
            hygiene_score=m["hygiene_score"],
            trust_score=m["trust_score"],
            is_fssai_verified=m["is_fssai_verified"],
            tags=m["tags"],
            gallery_images="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000,https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800,https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800",
            is_active=True
        )
        db.add(mess)
        db.commit()
        db.refresh(mess)

        # Add Menu Items
        for item_name, item_desc, meal_type in m["menu"]:
            item = MenuItem(
                mess_id=mess.id,
                name=item_name,
                description=item_desc,
                price=mess.price_per_meal,
                meal_type=meal_type,
                is_veg=mess.is_veg
            )
            db.add(item)

        # Add 5-8 Realistic Reviews per mess from different students
        import random
        selected_students = random.sample(students, random.randint(3, 5))
        
        comments = [
            "Food quality is excellent and feels just like home. Highly recommended!",
            "Very hygienic kitchen. The staff is polite and the monthly price is fair.",
            "I've tried many messes in this area, but this one is the most consistent in taste.",
            "Great value for money. The hygiene standards are definitely above average.",
            "A bit crowded during peak hours, but that's because the food is so good!",
            "The menu variety is great. They actually listen to student feedback.",
            "Been eating here for 3 months now. No health issues and taste is still great.",
            "Perfect for students on a budget who don't want to compromise on health."
        ]
        
        total_rating = 0
        for i, s in enumerate(selected_students):
            rating = random.randint(4, 5)
            hygiene = random.randint(4, 5)
            comment = comments[i % len(comments)]
            
            review = Review(
                id=uuid.uuid4(),
                mess_id=mess.id,
                student_id=s.id,
                rating=rating,
                hygiene_rating=hygiene,
                comment=comment
            )
            db.add(review)
            total_rating += rating
            
        mess.avg_rating = Decimal(str(round(total_rating / len(selected_students), 1)))
        mess.total_reviews = len(selected_students)

    db.commit()
    print("Demo data seeded successfully!")
    print(f"Admin: admin@trustbite.com / Admin@123")
    print(f"Students: {[s.email for s in students]} / Student@123")
    print(f"Owners: {[o.email for o in owners]} / Owner@123")
    db.close()

if __name__ == "__main__":
    seed_data()
