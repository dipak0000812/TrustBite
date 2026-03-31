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


def get_ai_suggestions(
    db:        Session,
    cuisine:   str | None = None,
    max_price: float | None = None,
    is_veg:    bool | None = None,
    min_trust: float = 6.0,
    top_n:     int = 3,
) -> list[Mess]:
    messes = db.query(Mess).filter(
        Mess.is_active == True,
        Mess.trust_score >= min_trust,
    ).all()

    if not messes:
        return []

    pref_vec = np.array([preference_to_vector(cuisine, max_price, is_veg)])
    mess_vecs = np.array([mess_to_vector(m) for m in messes])

    scores = cosine_similarity(pref_vec, mess_vecs)[0]  # shape (n_messes,)
    top_idxs = np.argsort(scores)[::-1][:top_n]

    return [messes[i] for i in top_idxs]
