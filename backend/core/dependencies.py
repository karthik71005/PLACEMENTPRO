import logging
from typing import Annotated

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.security import verify_firebase_token
from db.client import get_database

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


# ── Database Dependency ────────────────────────────────────────────────────────
async def get_db():
    """Yield the motor database handle for use in route dependencies."""
    db = await get_database()
    yield db


# ── Auth Dependency ────────────────────────────────────────────────────────────
async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ] = None,
    db=Depends(get_db),
) -> dict:
    """
    Extract and verify Firebase Bearer token, then fetch MongoDB user record.

    Returns:
        The MongoDB user document dict with keys: _id, firebase_uid, email, role.

    Raises:
        401 if token is missing or invalid.
        403 if user record is not found in MongoDB (not registered).
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        decoded = await verify_firebase_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    firebase_uid = decoded.get("uid")
    user = await db["users"].find_one({"firebase_uid": firebase_uid})

    if user is None:
        # User authenticated via Firebase but not yet registered in MongoDB.
        # Auto-create a minimal record so they can reach the registration flow.
        from datetime import datetime, timezone
        new_user = {
            "firebase_uid": firebase_uid,
            "email": decoded.get("email", ""),
            "role": "pending",   # frontend will redirect to /register to pick a real role
            "created_at": datetime.now(timezone.utc),
        }
        result = await db["users"].insert_one(new_user)
        new_user["_id"] = str(result.inserted_id)
        logger.info(
            "Auto-created pending user from Firebase token: uid=%s email=%s",
            firebase_uid,
            decoded.get("email", ""),
        )
        user = new_user

    # Serialize ObjectId so downstream code can JSON-serialize if needed
    user["_id"] = str(user["_id"])
    return user


# ── Role Guard Dependency Factory ─────────────────────────────────────────────
def require_role(roles: list[str]):
    """
    FastAPI dependency factory that restricts a route to users with one of the
    given roles.

    Usage:
        @router.get("/tpo/only", dependencies=[Depends(require_role(["tpo"]))])
    """
    async def role_checker(
        current_user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {roles}.",
            )
        return current_user

    return role_checker
