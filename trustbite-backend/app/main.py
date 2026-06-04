"""
TrustBite API — application entry-point.

Startup order matters:
  1. Logging must be configured BEFORE any module imports that call getLogger().
  2. Settings / config validation runs next (fail-fast).
  3. CORS, middleware, routers are wired last.

DO NOT call Base.metadata.create_all() here.
Alembic is the sole schema manager — mixing the two causes silent divergence.
"""

import logging
import traceback
import os
import uuid as uuid_lib

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE


# ── 1. Logging ────────────────────────────────────────────────────
# Must happen before any getLogger() calls elsewhere.
# We inject a `request_id` field via a Filter so the format string
# %(request_id)s is always available — avoids KeyError on every log line.

class _RequestIDFilter(logging.Filter):
    """Ensures every LogRecord has a `request_id` attribute."""
    def filter(self, record: logging.LogRecord) -> bool:  # noqa: A003
        if not hasattr(record, "request_id"):
            record.request_id = "-"  # type: ignore[attr-defined]
        return True


def _configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] [%(request_id)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    handler.addFilter(_RequestIDFilter())

    root = logging.getLogger()
    root.setLevel(logging.INFO)
    # Avoid duplicate handlers when uvicorn reloads in dev mode
    if not root.handlers:
        root.addHandler(handler)
    else:
        # Replace existing handlers added by basicConfig/uvicorn
        root.handlers = [handler]


_configure_logging()
logger = logging.getLogger("TrustBite")


# ── 2. Config / settings (fail-fast) ─────────────────────────────
from app.core.config import settings  # noqa: E402  (after logging)

_IS_PRODUCTION = settings.ENVIRONMENT.lower() == "production"


# ── 3. Docs URL guard ─────────────────────────────────────────────
# Swagger/ReDoc expose your full API surface — disable in production.
_docs_url = None if _IS_PRODUCTION else "/docs"
_redoc_url = None if _IS_PRODUCTION else "/redoc"


# ── 4. FastAPI application ────────────────────────────────────────
app = FastAPI(
    title="TrustBite API",
    description="Hyperlocal mess discovery platform",
    version="1.0.0",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
)


# ── 5. CORS ───────────────────────────────────────────────────────
_raw = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []
_explicit_origins = [o.strip() for o in _raw if o.strip()]

_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "https://trustbite-hazel.vercel.app",
]

allow_origins = list(set(_explicit_origins + _default_origins))

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


# ── 6. Request-ID middleware ──────────────────────────────────────
# Attaches a unique X-Request-ID to every request for end-to-end tracing.
# The frontend can read this header from error responses to correlate logs.
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid_lib.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


app.add_middleware(RequestIDMiddleware)


# ── 7. Rate-limiter setup (slowapi) ───────────────────────────
# The Limiter instance lives in app.core.limiter to avoid circular imports
# (routers import limiter; if limiter lived here they'd import main.py → circular).
from app.core.limiter import limiter              # noqa: E402
from slowapi import _rate_limit_exceeded_handler  # noqa: E402
from slowapi.errors import RateLimitExceeded      # noqa: E402

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── 8. Global exception handlers ─────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning("HTTP %s on %s: %s", exc.status_code, request.url.path, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error("Validation error on %s: %s", request.url.path, exc.errors())
    errors = [
        {"field": " → ".join(str(loc) for loc in e["loc"]), "message": e["msg"]}
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": errors, "status_code": 422},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s: %s", request.url.path, str(exc))
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status_code": 500},
    )


# ── 9. Routers ────────────────────────────────────────────────────
# ORDERING NOTE: FastAPI matches routes top-to-bottom within each router.
# Static-segment routes (e.g. /owner/mine) MUST be registered before
# wildcard-segment routes (e.g. /{mess_id}) to avoid shadowing.
# The messes router already registers /owner/mine before /{mess_id} — keep it that way.
from app.routers import auth, messes, favourites, search, ai_router, stats, admin  # noqa: E402

app.include_router(auth.router)        # /api/auth/*
app.include_router(messes.router)      # /api/messes/*
app.include_router(favourites.router)  # /api/favourites/*
app.include_router(search.router)      # /api/search/*
app.include_router(ai_router.router)   # /api/ai/*
app.include_router(stats.router)       # /api/stats/*
app.include_router(admin.router)       # /api/admin/*


# ── 10. Static files ──────────────────────────────────────────────
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# ── 11. Startup: schedule background tasks ────────────────────────
from contextlib import asynccontextmanager  # noqa: E402
import threading  # noqa: E402
import time      # noqa: E402


@asynccontextmanager
async def _lifespan(application):
    """
    Application lifespan handler (replaces deprecated @app.on_event).
    Starts the hourly token-cleanup daemon thread on startup.
    """
    from app.tasks import cleanup_expired_tokens

    def _hourly_cleanup():
        while True:
            time.sleep(3600)
            cleanup_expired_tokens()

    t = threading.Thread(target=_hourly_cleanup, daemon=True, name="token-cleanup")
    t.start()
    logger.info("Background task started: token-cleanup (hourly)")

    yield  # application runs here
    # teardown (nothing needed for daemon threads)


# Re-attach the lifespan to the already-created app instance
app.router.lifespan_context = _lifespan


# ── 11. Health endpoints ──────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "service": "TrustBite API",
        "version": "1.0.0",
        "docs": None if _IS_PRODUCTION else "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    """
    Readiness probe.

    Returns HTTP 200 + {"status": "ok"} when the database is reachable.
    Returns HTTP 503 + {"status": "error"} when it is not.

    Load balancers and container orchestrators (Render, Railway, Fly.io)
    check the HTTP status code — returning 200 on failure would prevent
    automatic failover/restart.
    """
    from app.db.database import engine  # local import avoids circular at module level

    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Health check DB failure: %s", str(exc))
        db_status = "disconnected"

    is_healthy = db_status == "connected"
    return JSONResponse(
        status_code=200 if is_healthy else HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "ok" if is_healthy else "error",
            "service": "TrustBite API",
            "database": db_status,
        },
    )