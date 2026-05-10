# app/routers/reviews.py

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)

# Intentionally empty.
# Reviews are handled inside:
# /api/messes/{mess_id}/reviews