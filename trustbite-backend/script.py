import pandas as pd
import numpy as np
import uuid
import random

NUM_ROWS = 1000

cities = ["Pune","Mumbai","Nashik","Nagpur","Aurangabad","Solapur","Shirpur"]
food_types = ["veg","veg+egg","veg+nonveg"]

mess_names = [
    "Annapurna Mess","Shree Mess","Campus Tiffin","Sai Mess","Maa Tiffin",
    "Student Kitchen","Green Plate Mess","Hostel Bhojan","Daily Thali",
    "Smart Mess","HomeStyle Meals","Fresh Plate Mess"
]

data = []

for i in range(NUM_ROWS):

    hygiene = round(np.clip(np.random.normal(3.9,0.6),1,5),2)
    taste = round(np.clip(np.random.normal(4.0,0.5),1,5),2)
    consistency = round(np.clip(np.random.normal(3.8,0.5),1,5),2)
    punctuality = round(np.clip(np.random.normal(4.1,0.4),1,5),2)

    avg_rating = round((hygiene+taste+consistency+punctuality)/4,2)

    complaints = round(np.clip(np.random.beta(2,8),0,1),2)

    retention = random.randint(1,12)

    trust_score = round(
        (0.30*hygiene) +
        (0.25*taste) +
        (0.20*consistency) +
        (0.15*punctuality) -
        (0.10*complaints*5),
        2
    )

    row = {
        "mess_id": str(uuid.uuid4()),
        "mess_name": random.choice(mess_names),
        "city": random.choice(cities),
        "food_type": random.choice(food_types),
        "monthly_price": random.randint(2200,4500),
        "seating_capacity": random.randint(40,150),

        "hygiene_score": hygiene,
        "taste_score": taste,
        "consistency_score": consistency,
        "punctuality_score": punctuality,

        "avg_rating": avg_rating,
        "total_reviews": random.randint(10,200),

        "complaint_ratio": complaints,
        "retention_months": retention,

        "trust_score": trust_score,

        "veg_days_per_week": random.randint(5,7),
        "special_items_count": random.randint(1,8)
    }

    data.append(row)

df = pd.DataFrame(data)

df.to_csv("trustbite_dataset_1000.csv", index=False)

print("Dataset with 1000 rows generated successfully.")