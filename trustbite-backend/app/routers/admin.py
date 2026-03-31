from fastapi import APIRouter

# Admin-specific routes are handled via the messes router (PUT /api/messes/:id for hygiene/FSSAI)
# and the auth router (GET /api/auth/users for user listing).
# This file exists for consistency with the original folder structure.

router = APIRouter(prefix='/api/admin', tags=['Admin'])
