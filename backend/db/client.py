import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from core.config import settings

logger = logging.getLogger(__name__)

# Module-level client (one per process)
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            settings.mongo_uri,
            maxPoolSize=10,
            serverSelectionTimeoutMS=5000,
        )
        logger.info("Motor MongoDB client created.")
    return _client


async def get_database() -> AsyncIOMotorDatabase:
    """Return the main application database handle."""
    return get_client()[settings.mongo_db_name]


async def ping_database() -> bool:
    """Return True if MongoDB is reachable."""
    try:
        client = get_client()
        await client.admin.command("ping")
        return True
    except Exception as exc:
        logger.warning("MongoDB ping failed: %s", exc)
        return False


async def ensure_indexes():
    """Create required indexes on application collections (idempotent)."""
    db = get_client()[settings.mongo_db_name]

    # notifications_log (Sprint 3)
    await db["notifications_log"].create_index("drive_id")
    await db["notifications_log"].create_index("sent_at")

    # interviews (Sprint 3)
    await db["interviews"].create_index("drive_id")

    # applications (Sprint 2)
    await db["applications"].create_index("student_id")
    await db["applications"].create_index("drive_id")
    await db["applications"].create_index([("student_id", 1), ("drive_id", 1)], unique=True)

    # students (Sprint 2)
    await db["students"].create_index("user_id", unique=True)

    # company_drives (Sprint 2)
    await db["company_drives"].create_index("status")

    # alumni_slots (Sprint 4)
    await db["alumni_slots"].create_index("alumni_id")
    await db["alumni_slots"].create_index("is_booked")
    await db["alumni_slots"].create_index("start_time")

    # job_referrals (Sprint 4)
    await db["job_referrals"].create_index("alumni_id")
    await db["job_referrals"].create_index("posted_at")

    logger.info("MongoDB indexes ensured.")
