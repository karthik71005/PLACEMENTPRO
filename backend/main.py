import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pythonjsonlogger import jsonlogger

from core.config import settings
from core.cache import init_redis, close_redis
from db.client import ping_database, ensure_indexes
from routers import auth

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# ── Logging Setup ─────────────────────────────────────────────────────────────
def _configure_logging() -> None:
    log_handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )
    log_handler.setFormatter(formatter)
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level.upper())
    root_logger.handlers = [log_handler]


_configure_logging()
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("PlacementPro API starting up…")
    db_ok = await ping_database()
    if db_ok:
        logger.info("MongoDB connection: OK")
        await ensure_indexes()
    else:
        logger.warning("MongoDB connection: FAILED — check MONGO_URI")
    await init_redis()
    yield
    await close_redis()
    logger.info("PlacementPro API shutting down.")


# ── FastAPI Application ────────────────────────────────────────────────────────
app = FastAPI(
    title="PlacementPro API",
    description="Integrated campus career suite — backend REST API",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Middleware ────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SlowAPIMiddleware)


# ── Request-ID & Logging Middleware ───────────────────────────────────────────
@app.middleware("http")
async def request_id_and_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    response.headers["X-Request-ID"] = request_id
    logger.info(
        "HTTP request processed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


# ── Global Exception Handlers ─────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Returns field-level validation errors as 422."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catches any unhandled exception; returns 500 with a reference ID."""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.error(
        "Unhandled exception",
        exc_info=exc,
        extra={"request_id": request_id, "path": request.url.path},
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": request_id,
        },
    )


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Service health check")
async def health_check():
    """
    Returns API status and MongoDB connection state.
    Used by monitoring tools and Docker health checks.
    """
    db_connected = await ping_database()
    return {
        "status": "ok",
        "database": "connected" if db_connected else "disconnected",
        "environment": settings.environment,
    }


# ── Router Registration ────────────────────────────────────────────────────────
app.include_router(auth.router)

# Sprint 2 routers
from routers import students, drives, applications  # noqa: E402
app.include_router(students.router)
app.include_router(drives.router)
app.include_router(applications.router)

# Sprint 3 routers
from routers import notifications, interviews  # noqa: E402
app.include_router(notifications.router)
app.include_router(interviews.router)

# Sprint 4 routers
from routers import alumni  # noqa: E402
app.include_router(alumni.router)

# Sprint 5 routers
from routers import ai
app.include_router(ai.router)

