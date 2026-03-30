import math

def calculate_trust_score(
    avg_rating: float,         # 0-5  → contributes 40%
    hygiene_score: float,      # 0-10 → contributes 40%
    total_reviews: int,        # volume bonus up to 10%
    is_fssai_verified: bool,   # binary bonus: 10%
) -> float:
    """
    Returns a trust score between 0.0 and 10.0.
    Stored as DECIMAL(3,1) on the messes table.
    """
    # Normalize avg_rating from 0-5 to 0-10
    rating_component = (avg_rating / 5.0) * 10.0 * 0.40

    # Hygiene is already 0-10
    hygiene_component = float(hygiene_score or 0) * 0.40

    # Review volume: log-scale bonus, max 1.0 point
    volume_bonus = min(math.log10(max(total_reviews, 1)) / 3.0, 1.0) * 0.10 * 10.0

    # FSSAI verification bonus
    fssai_bonus = 1.0 if is_fssai_verified else 0.0

    raw = rating_component + hygiene_component + volume_bonus + fssai_bonus
    return round(min(raw, 10.0), 1)
