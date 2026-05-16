import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from app.models.mess import Mess

CUISINE_MAP = {
    'north_indian': 0, 'south_indian': 1, 'maharashtrian': 2,
    'gujarati': 3, 'chinese': 4, 'continental': 5,
    'rajasthani': 6, 'multi_cuisine': 7, 'other': 8,
}


def mess_to_vector(mess: Mess) -> list[float]:
    """
    Feature vector: [trust_score/10, avg_rating/5, price_norm, is_veg, cuisine_one_hot x9]
    Total dimensions: 4 + 9 = 13
    """
    max_price = 200.0
    price_norm = 1.0 - min(float(mess.price_per_meal) / max_price, 1.0)  # cheaper = higher
    trust_norm = float(mess.trust_score or 0) / 10.0
    rating_norm = float(mess.avg_rating or 0) / 5.0
    veg_val = 1.0 if mess.is_veg else 0.0

    cuisine_vec = [0.0] * 9
    if mess.cuisine_type and mess.cuisine_type in CUISINE_MAP:
        cuisine_vec[CUISINE_MAP[mess.cuisine_type]] = 1.0

    return [trust_norm, rating_norm, price_norm, veg_val] + cuisine_vec


def preference_to_vector(
    cuisine:   str | None = None,
    max_price: float | None = None,
    is_veg:    bool | None = None,
) -> list[float]:
    """Build preference vector matching mess_to_vector dimensions."""
    price_norm = 1.0 - min((max_price or 100) / 200.0, 1.0)
    veg_val = 1.0 if is_veg else (0.5 if is_veg is None else 0.0)

    cuisine_vec = [0.0] * 9
    if cuisine and cuisine in CUISINE_MAP:
        cuisine_vec[CUISINE_MAP[cuisine]] = 1.0
    else:
        cuisine_vec = [1.0 / 9] * 9  # no preference → equal weight

    return [1.0, 1.0, price_norm, veg_val] + cuisine_vec  # trust + rating = 1.0 (prefer best)


from app.models.user import User

def get_ai_suggestions(
    db:        Session,
    user:      User,
    cuisine:   str | None = None,
    max_price: float | None = None,
    is_veg:    bool | None = None,
    min_trust: float = 6.0,
    top_n:     int = 3,
) -> list[Mess]:
    """
    Enhanced Recommendation Engine:
    1. Filter by city & min_trust
    2. Rank by:
       - Diet match (Mandatory)
       - Proximity (Pincode match + Landmark/Area context)
       - Budget compatibility
       - Hygiene & Trust scores
       - Student Priority bonus
    """
    prefs = user.preferences or {}
    student_city = prefs.get('city', user.college_name or 'Shirpur')
    student_pincode = prefs.get('pincode', '')
    student_diet = prefs.get('diet', 'Veg')
    student_budget = prefs.get('budget', 'Medium')
    student_priority = prefs.get('priority', 'Hygiene')

    # Base Query
    query = db.query(Mess).filter(
        Mess.is_active == True,
        Mess.trust_score >= min_trust,
        Mess.city == student_city
    )

    messes = query.all()
    if not messes:
        return []

    ranked_messes = []
    for m in messes:
        score = 0.0
        
        # 1. Diet Match (Critical)
        if student_diet == 'Veg' and not m.is_veg:
            score -= 10.0 # Heavy penalty for non-veg if user wants veg
        elif student_diet == 'Jain' and 'Jain' not in (m.tags or ''):
            score -= 5.0
        else:
            score += 2.0

        # 2. Proximity Boost
        if student_pincode and m.pincode == student_pincode:
            score += 3.0
        
        # 3. Budget Alignment
        m_price = float(m.price_per_meal)
        if student_budget == 'Low' and m_price <= 70: score += 2.0
        elif student_budget == 'Medium' and 70 < m_price <= 100: score += 2.0
        elif student_budget == 'High' and m_price > 100: score += 2.0

        # 4. Quality Metrics
        score += float(m.hygiene_score or 0) / 2.0
        score += float(m.trust_score or 0) / 2.0
        score += float(m.avg_rating or 0)

        # 5. Priority Bonus
        if 'Hygiene' in student_priority and m.hygiene_score and m.hygiene_score >= 8.5:
            score += 2.0
        if 'Price' in student_priority and m_price < 85:
            score += 2.0
        
        ranked_messes.append((m, score))

    # Sort by score descending
    ranked_messes.sort(key=lambda x: x[1], reverse=True)
    
    return [m[0] for m in ranked_messes[:top_n]]
