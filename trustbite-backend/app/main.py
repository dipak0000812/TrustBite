from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routers import auth, messes, favourites, search, ai_router, stats

app = FastAPI(
    title='TrustBite API',
    description='Hyperlocal mess discovery platform',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# ── Global Exception Handlers ────────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={'detail': exc.detail, 'status_code': exc.status_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
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


# ── Health Check ──────────────────────────────────────────────────

@app.get('/', tags=['Health'])
def root():
    return {'service': 'TrustBite API', 'version': '1.0.0', 'docs': '/docs'}


@app.get('/health', tags=['Health'])
def health():
    return {'status': 'ok'}