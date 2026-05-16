import logging
import traceback
from fastapi import FastAPI, Request
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from fastapi.staticfiles import StaticFiles
from app.routers import auth, messes, favourites, search, ai_router, stats, admin
import os

app = FastAPI(
    title='TrustBite API',
    description='Hyperlocal mess discovery platform',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
)

from app.db.database import engine
from app.models.base import Base
# ensure all models are imported so they register with Base
from app.models.user import User
from app.models.mess import Mess
from app.models.menu_item import MenuItem
from app.models.review import Review
from app.models.favourite import Favourite

Base.metadata.create_all(bind=engine)

from app.core.config import settings

# ── CORS ──────────────────────────────────────────────────────────
# Parse CORS_ORIGINS from settings if provided, otherwise use defaults
raw_origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []
allow_origins = [origin.strip() for origin in raw_origins if origin.strip()]

# Add default development and production origins
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "https://trustbite-hazel.vercel.app",
]

# Merge and deduplicate
allow_origins = list(set(allow_origins + default_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Logging Setup ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("TrustBite")


# ── Global Exception Handlers ────────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP {exc.status_code} on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={'detail': exc.detail, 'status_code': exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation Error on {request.url.path}: {exc.errors()}")
    errors = [
        {'field': ' → '.join(str(loc) for loc in e['loc']), 'message': e['msg']}
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={'detail': errors, 'status_code': 422},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"CRITICAL ERROR on {request.url.path}: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={'detail': 'Internal server error', 'status_code': 500},
    )


# ── Routers ───────────────────────────────────────────────────────
app.include_router(auth.router)          # /api/auth/*
app.include_router(messes.router)        # /api/messes/*
app.include_router(favourites.router)    # /api/favourites/*
app.include_router(search.router)        # /api/search/*
app.include_router(ai_router.router)     # /api/ai/*
app.include_router(stats.router)         # /api/stats/*
app.include_router(admin.router)         # /api/admin/*

# Static files for uploads
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# ── Health Check ──────────────────────────────────────────────────

@app.get('/', tags=['Health'])
def root():
    return {'service': 'TrustBite API', 'version': '1.0.0', 'docs': '/docs'}


@app.get('/health', tags=['Health'])
def health():
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Health check DB failure: {str(e)}")
        db_status = "disconnected"

    return {
        "status": "ok" if db_status == "connected" else "error",
        "service": "TrustBite API",
        "database": db_status
    }