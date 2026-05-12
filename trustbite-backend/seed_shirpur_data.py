import uuid
import random
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import SessionLocal
from app.models.user import User
from app.models.mess import Mess
from app.models.review import Review
from app.models.menu_item import MenuItem
from app.core.security import hash_password

SHIRPUR_MESSES = [
    {
        "name": "Jogeshwari mess",
        "rating": 4.8,
        "address": "Pitreshwer Colony, Swami Vivekanand Nagar, Shirpur",
        "contact": "+91 99755 19994",
        "type": "Veg",
        "monthly": 2700,
        "per_meal": 85,
        "trust": 9.1,
        "hygiene": 8.8,
        "fssai": True,
        "timings": {"breakfast": "8:00 AM – 10:00 AM", "lunch": "12:00 PM – 3:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Top Rated,Verified,RO Water",
        "image": "/images/shirpur/1.jpeg",
        "gallery": ["/images/shirpur/16.jpeg", "/images/shirpur/17.jpeg"]
    },
    {
        "name": "Sadguru mess & bhojnalaya",
        "rating": 4.5,
        "address": "Balaji Nagar, Karvand Road, Shirpur",
        "contact": "+91 93739 92152",
        "type": "Veg",
        "monthly": 2400,
        "per_meal": 75,
        "trust": 8.4,
        "hygiene": 8.1,
        "fssai": False,
        "timings": {"breakfast": "8:00 AM – 9:30 AM", "lunch": "12:00 PM – 2:30 PM", "dinner": "7:00 PM – 9:30 PM"},
        "tags": "Budget Friendly,Popular,Karvand Road",
        "image": "/images/shirpur/2.jpeg",
        "gallery": ["/images/shirpur/18.jpeg"]
    },
    {
        "name": "Purva mess",
        "rating": 5.0,
        "address": "Balaji Nagar, Karvand Road, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Veg",
        "monthly": 2300,
        "per_meal": 70,
        "trust": 8.2,
        "hygiene": 8.0,
        "fssai": False,
        "timings": {"lunch": "12:00 PM – 3:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Homely Taste,Low Budget,Student Choice",
        "image": "/images/shirpur/3.jpeg",
        "gallery": []
    },
    {
        "name": "Magare Mess & Rooms",
        "rating": 5.0,
        "address": "Sane Guruji Colony, Shirpur",
        "contact": "+91 94049 72764",
        "type": "Veg",
        "monthly": 3000,
        "per_meal": 90,
        "trust": 8.8,
        "hygiene": 8.6,
        "fssai": True,
        "timings": {"breakfast": "8:00 AM – 9:30 AM", "lunch": "12:30 PM – 3:00 PM", "dinner": "7:30 PM – 10:00 PM"},
        "tags": "Rooms Available,RO Water,Clean",
        "image": "/images/shirpur/4.jpeg",
        "gallery": ["/images/shirpur/19.jpeg"]
    },
    {
        "name": "Agrawal Bhojnalay and Mess",
        "rating": 4.0,
        "address": "Near Chamunda Mata Mandir, Karwand, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Veg",
        "monthly": 2600,
        "per_meal": 80,
        "trust": 8.5,
        "hygiene": 8.2,
        "fssai": False,
        "timings": {"lunch": "10:00 AM – 2:30 PM", "dinner": "6:30 PM – 9:30 PM"},
        "tags": "Good Quality,Monthly Plans,Verified",
        "image": "/images/shirpur/5.jpeg",
        "gallery": []
    },
    {
        "name": "Dasha mata mess",
        "rating": 4.5,
        "address": "Karvand Road, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Veg",
        "monthly": 2500,
        "per_meal": 80,
        "trust": 8.3,
        "hygiene": 8.0,
        "fssai": False,
        "timings": {"lunch": "12:00 PM – 3:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Good Taste,Student Area,Popular",
        "image": "/images/shirpur/6.jpeg",
        "gallery": []
    },
    {
        "name": "Harikrishna Gharguti Mess",
        "rating": 5.0,
        "address": "Padmavati Nagar, Shirpur",
        "contact": "+91 86239 90180",
        "type": "Veg",
        "monthly": 2800,
        "per_meal": 85,
        "trust": 9.0,
        "hygiene": 8.9,
        "fssai": True,
        "timings": {"lunch": "10:00 AM – 2:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Home-style,Fresh,Trusted",
        "image": "/images/shirpur/7.jpeg",
        "gallery": []
    },
    {
        "name": "Aryan Mess And Bhojnalay",
        "rating": 4.2,
        "address": "Saibaba Colony, Shirpur",
        "contact": "+91 75076 80047",
        "type": "Veg",
        "monthly": 2400,
        "per_meal": 75,
        "trust": 8.1,
        "hygiene": 7.9,
        "fssai": False,
        "timings": {"lunch": "10:00 AM – 1:30 PM", "dinner": "5:00 PM – 10:30 PM"},
        "tags": "Affordable,Filling,Student Favorite",
        "image": "/images/shirpur/8.jpeg",
        "gallery": []
    },
    {
        "name": "Aai Saptshrungi Mess",
        "rating": 4.1,
        "address": "Shiv Parvati Colony, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Veg",
        "monthly": 2200,
        "per_meal": 70,
        "trust": 7.9,
        "hygiene": 7.8,
        "fssai": False,
        "timings": {"lunch": "12:00 PM – 3:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Low Budget,Friendly,Shirpur",
        "image": "/images/shirpur/9.jpeg",
        "gallery": []
    },
    {
        "name": "Shri kumkum Dining Hall",
        "rating": 4.0,
        "address": "Gajanan Colony, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Veg",
        "monthly": 2600,
        "per_meal": 85,
        "trust": 8.4,
        "hygiene": 8.2,
        "fssai": False,
        "timings": {"lunch": "12:00 PM – 3:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Balanced Price,Student Facility",
        "image": "/images/shirpur/10.jpeg",
        "gallery": ["/images/shirpur/20.jpeg", "/images/shirpur/21.jpeg"]
    },
    {
        "name": "Shri devdatta Bhojnalay And Mess",
        "rating": 3.8,
        "address": "Sai Baba Colony, Shirpur",
        "contact": "+91 97671 41418",
        "type": "Veg",
        "monthly": 2500,
        "per_meal": 80,
        "trust": 8.0,
        "hygiene": 7.9,
        "fssai": False,
        "timings": {"lunch": "10:00 AM – 1:30 PM", "dinner": "5:00 PM – 10:30 PM"},
        "tags": "Traditional,Affordable",
        "image": "/images/shirpur/11.jpeg",
        "gallery": ["/images/shirpur/22.jpeg"]
    },
    {
        "name": "Jain mess",
        "rating": 4.9,
        "address": "Market Road, Near Jai Laxmi, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Jain",
        "monthly": 3200,
        "per_meal": 110,
        "trust": 9.3,
        "hygiene": 9.1,
        "fssai": True,
        "timings": {"lunch": "12:00 PM – 2:30 PM", "dinner": "7:30 PM – 9:30 PM"},
        "tags": "Jain Food,Satvik,High Hygiene",
        "image": "/images/shirpur/13.jpeg",
        "gallery": ["/images/shirpur/23.jpeg", "/images/shirpur/24.jpeg"]
    },
    {
        "name": "New Samarth mess",
        "rating": 4.0,
        "address": "Shirpur Mandal Area, Shirpur",
        "contact": "+91 00000 00000",
        "type": "Veg",
        "monthly": 2300,
        "per_meal": 75,
        "trust": 7.8,
        "hygiene": 7.7,
        "fssai": False,
        "timings": {"lunch": "12:00 PM – 3:00 PM", "dinner": "7:00 PM – 10:00 PM"},
        "tags": "Budget-friendly,Veg Thali",
        "image": "/images/shirpur/15.jpeg",
        "gallery": ["/images/shirpur/25.jpeg", "/images/shirpur/26.jpeg"]
    }
]

def seed_shirpur():
    db: Session = SessionLocal()
    
    print("Seeding Shirpur messes...")
    
    # Get some students for reviews
    students = db.query(User).filter(User.role == "student").all()
    if not students:
        print("No students found. Please run seed_demo_data.py first.")
        return

    pwd_hash = hash_password("Shirpur@123")
    
    for m_data in SHIRPUR_MESSES:
        # Create Owner
        owner_email = f"{m_data['name'].lower().replace(' ', '_')}@owner.com"
        owner = db.query(User).filter(User.email == owner_email).first()
        if not owner:
            owner = User(
                id=uuid.uuid4(),
                email=owner_email,
                password_hash=pwd_hash,
                full_name=f"Owner of {m_data['name']}",
                phone=m_data["contact"],
                role="mess_owner",
                is_active=True
            )
            db.add(owner)
            db.commit()
            db.refresh(owner)
        
        # Create Mess
        mess = db.query(Mess).filter(Mess.name == m_data["name"]).first()
        if not mess:
            mess = Mess(
                id=uuid.uuid4(),
                owner_id=owner.id,
                owner_phone=m_data["contact"],
                name=m_data["name"],
                description=f"Best {m_data['type']} food in {m_data['address']}. Authentic Shirpur taste.",
                address=m_data["address"],
                city="Shirpur",
                pincode="425405",
                cuisine_type="maharashtrian" if m_data["type"] == "Veg" else "jain",
                price_per_meal=Decimal(str(m_data["per_meal"])),
                monthly_price=Decimal(str(m_data["monthly"])),
                weekly_price=Decimal(str(m_data["per_meal"] * 7)),
                is_veg=True,
                serves_breakfast="breakfast" in m_data["timings"],
                serves_lunch="lunch" in m_data["timings"],
                serves_dinner="dinner" in m_data["timings"],
                breakfast_time=m_data["timings"].get("breakfast"),
                lunch_time=m_data["timings"].get("lunch"),
                dinner_time=m_data["timings"].get("dinner"),
                hygiene_score=Decimal(str(m_data["hygiene"])),
                trust_score=Decimal(str(m_data["trust"])),
                avg_rating=Decimal(str(m_data["rating"])),
                is_fssai_verified=m_data["fssai"],
                tags=m_data["tags"],
                image_url=m_data["image"],
                gallery_images=",".join(m_data["gallery"]) if m_data["gallery"] else None,
                is_active=True
            )
            db.add(mess)
            db.commit()
            db.refresh(mess)
            
            # Add Menu Items
            menu_items = [
                ("Special Sunday Thali", "Paneer, Dal, Rice, Chapati, Sweet", "Lunch"),
                ("Daily Veg Thali", "2 Sabji, Dal, Rice, Chapati", "Lunch"),
                ("Evening Light Meal", "Khichdi or Bhaji Roti", "Dinner")
            ]
            for name, desc, m_type in menu_items:
                db.add(MenuItem(
                    mess_id=mess.id,
                    name=name,
                    description=desc,
                    price=mess.price_per_meal,
                    meal_type=m_type,
                    is_veg=True
                ))
            
            # Add Reviews
            comments = [
                "Good quality food for hostel students.",
                "Hygiene standards are above average.",
                "Affordable for engineering students.",
                "Homely taste and very clean.",
                "Feels like homemade food."
            ]
            num_reviews = random.randint(2, 4)
            selected_students = random.sample(students, min(num_reviews, len(students)))
            for i, student in enumerate(selected_students):
                db.add(Review(
                    id=uuid.uuid4(),
                    mess_id=mess.id,
                    student_id=student.id,
                    rating=random.randint(4, 5) if m_data["rating"] >= 4.5 else random.randint(3, 4),
                    hygiene_rating=int(m_data["hygiene"] // 2),
                    comment=comments[i % len(comments)]
                ))
            
            mess.total_reviews = num_reviews
            db.commit()

    print("Shirpur dataset integrated successfully!")
    db.close()

if __name__ == "__main__":
    seed_shirpur()
