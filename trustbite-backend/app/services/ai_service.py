"""
AI recommendation service.

Uses a scored-ranking algorithm (no ML library needed).
scikit-learn and numpy have been removed from requirements.txt (HIGH-07).
"""

from sqlalchemy.orm import Session, joinedload

from app.models.mess import Mess
from app.models.user import User


def get_ai_suggestions(
    db: Session,
    user: User,
    cuisine: str | None = None,
    max_price: float | None = None,
    is_veg: bool | None = None,
    min_trust: float = 6.0,
    top_n: int = 3,
) -> list[Mess]:
    """
    Return the top-N recommended messes for a user.

    Scoring breakdown (higher = better):
      1. Diet match   — heavy penalty for veg/Jain violations, small bonus otherwise
      2. Proximity    — pincode exact-match bonus
      3. Budget       — price-range alignment bonus
      4. Quality      — hygiene_score, trust_score, avg_rating
      5. Priority     — extra bonus for user's stated priority (Hygiene / Price)

    City filter uses case-insensitive ILIKE so "shirpur" matches "Shirpur" (MED-09 fix).
    """
    prefs = user.preferences or {}

    # MED-09: was `Mess.city == student_city` (case-sensitive exact match)
    student_city: str = prefs.get("city") or user.college_name or ""
    student_pincode: str = prefs.get("pincode", "")
    student_diet: str = prefs.get("diet", "Veg")
    student_budget: str = prefs.get("budget", "Medium")
    student_priority: str = prefs.get("priority", "Hygiene")

    query = (
        db.query(Mess)
        .options(joinedload(Mess.owner))
        .filter(
            Mess.is_active == True,       # noqa: E712
            Mess.trust_score >= min_trust,
        )
    )

    # Apply city filter only when we have a city value
    if student_city:
        query = query.filter(Mess.city.ilike(f"%{student_city}%"))  # MED-09 fix

    # Apply explicit request-time filters (from query params)
    if is_veg is not None:
        query = query.filter(Mess.is_veg == is_veg)
    if cuisine:
        query = query.filter(Mess.cuisine_type == cuisine)
    if max_price is not None:
        query = query.filter(Mess.price_per_meal <= max_price)

    messes = query.all()
    if not messes:
        return []

    ranked: list[tuple[Mess, float]] = []

    for m in messes:
        score = 0.0

        # 1. Diet match
        if student_diet == "Veg" and not m.is_veg:
            score -= 10.0   # heavy penalty — never show non-veg to veg user
        elif student_diet == "Jain" and "Jain" not in (m.tags or ""):
            score -= 5.0
        else:
            score += 2.0

        # 2. Proximity
        if student_pincode and m.pincode == student_pincode:
            score += 3.0

        # 3. Budget alignment
        m_price = float(m.price_per_meal)
        if student_budget == "Low" and m_price <= 70:
            score += 2.0
        elif student_budget == "Medium" and 70 < m_price <= 100:
            score += 2.0
        elif student_budget == "High" and m_price > 100:
            score += 2.0

        # 4. Quality metrics
        score += float(m.hygiene_score or 0) / 2.0
        score += float(m.trust_score or 0) / 2.0
        score += float(m.avg_rating or 0)

        # 5. Priority bonus
        if "Hygiene" in student_priority and m.hygiene_score and m.hygiene_score >= 8.5:
            score += 2.0
        if "Price" in student_priority and m_price < 85:
            score += 2.0

        ranked.append((m, score))

    ranked.sort(key=lambda x: x[1], reverse=True)
    return [m for m, _ in ranked[:top_n]]
