import json
import logging
from typing import Any, Optional
import redis.asyncio as redis

from core.config import settings

logger = logging.getLogger(__name__)

# Global redis client
_redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initialize the Redis client."""
    global _redis_client
    try:
        _redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        await _redis_client.ping()
        logger.info("Connected to Redis successfully.")
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}. Caching will be disabled.")
        _redis_client = None

def get_redis() -> Optional[redis.Redis]:
    return _redis_client

async def close_redis():
    """Close the Redis connection."""
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None

async def cache_get(key: str) -> Optional[Any]:
    """Retrieve and deserialize a JSON-encoded value from cache."""
    if not _redis_client:
        return None
    try:
        val = await _redis_client.get(key)
        if val:
            return json.loads(val)
    except Exception as e:
        logger.error(f"Redis get failed for key {key}: {e}")
    return None

async def cache_set(key: str, value: Any, ttl_seconds: int = 60) -> bool:
    """Serialize and store a value in cache with a TTL."""
    if not _redis_client:
        return False
    try:
        data = json.dumps(value, default=str)
        await _redis_client.set(key, data, ex=ttl_seconds)
        return True
    except Exception as e:
        logger.error(f"Redis set failed for key {key}: {e}")
    return False
