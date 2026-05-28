import logging
import traceback
import os
import uuid as uuid_lib
from fastapi import FastAPI, Request
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from fastapi.staticfiles import StaticFiles
from app.routers import auth, messes, favourites, search, ai_router, stats, admin

# ── Docs URL Guard ───────────────────────────────────────────────
# Swagger (/docs) and ReDoc (/redoc) expose your full API schema.
# They MUST be disabled in production to prevent API surface enumeration.
_IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"
_docs_url = None if _IS_PRODUCTION else "/docs"
_redoc_url = None if _IS_PRODUCTION else "/redoc"

app = FastAPI(
    title='TrustBite API',
    description='Hyperlocal mess discovery platform',
    version='1.0.0',
    docs_url=_docs_url,
    redoc_url=_redoc_url,
)

# ──────────────────────────────────────────────────────────────────────
# DATABASE SCHEMA ORCHESTRATION WARNING:
# DO NOT USE Base.metadata.create_all(bind=engine) here.
# Running metadata.create_all alongside Alembic migrations leads to
# database schema divergence and untracked changes, bypassing migration
# records. Alembic MUST remain the sole manager of database schemas.
# ──────────────────────────────────────────────────────────────────────

from app.core.config import settings

# ── Startup config validation ─────────────────────────────────────
# Crash fast at boot if critical config is missing or insecure.
# This is safer than failing silently at the first authenticated request.
_SECRET_KEY = os.getenv("SECRET_KEY", "")
if not _SECRET_KEY:
    raise RuntimeError(
        "FATAL: SECRET_KEY environment variable is not set. "
        "The application cannot start without a secret key."
    )
if len(_SECRET_KEY) < 32:
    raise RuntimeError(
        f"FATAL: SECRET_KEY is too short ({len(_SECRET_KEY)} chars). "
        "Minimum required length is 32 characters. "
        "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

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

# In production: restrict to explicit methods and headers only.
# In development: wildcards are fine for DX.
if _IS_PRODUCTION:
    _allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    _allow_headers = ["Authorization", "Content-Type", "Accept", "X-Request-ID"]
else:
    _allow_methods = ["*"]
    _allow_headers = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=_allow_methods,
    allow_headers=_allow_headers,
)


# ── Logging Setup ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(request_id)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("TrustBite")


# ── Request ID Middleware ─────────────────────────────────────────
# Attaches a unique X-Request-ID to every request for end-to-end tracing.
# Frontend can read this header from error responses to correlate with logs.
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid_lib.uuid4()))
        # Store on request state so handlers can read it
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

app.add_middleware(RequestIDMiddleware)


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
    return {
        'service': 'TrustBite API',
        'version': '1.0.0',
        'docs': None if _IS_PRODUCTION else '/docs',
    }


@app.get('/health', tags=['Health'])
def health():
    db_status = "connected"
    try:
        from app.db.database import engine
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