import logging
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request

from core.dependencies import get_current_user, get_db
from core.security import verify_firebase_token
from models.user import UserCreateSchema, UserPublicSchema

# Setup custom rate limits for Auth
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger(__name__)


@router.post(
    "/verify",
    summary="Verify Firebase token and register/login user",
    description=(
        "Called immediately after Firebase client-side authentication. "
        "Verifies the JWT, upserts the user record in MongoDB, and returns the user's role."
    ),
    status_code=status.HTTP_200_OK,
)
@limiter.limit("10/minute")
async def verify_and_register(
    request: Request,
    payload: UserCreateSchema,
    db=Depends(get_db),
):
    """
    - Accepts `firebase_uid`, `email`, `role` in the request body.
    - Upserts a user document in the `users` collection.
    - Returns `{role, user_id}`.
    """
    users_col = db["users"]

    # Upsert: create if not exists, preserve existing role if already registered
    existing = await users_col.find_one({"firebase_uid": payload.firebase_uid})

    if existing:
        # If user already has a real role, return it unchanged
        if existing.get("role") not in (None, "pending"):
            return {
                "user_id": str(existing["_id"]),
                "role": existing["role"],
                "message": "User already registered.",
            }
        # User was auto-created with role='pending' — update to the chosen role
        await users_col.update_one(
            {"_id": existing["_id"]},
            {"$set": {"role": payload.role}},
        )
        logger.info("Promoted pending user to role=%s: %s", payload.role, payload.email)
        return {
            "user_id": str(existing["_id"]),
            "role": payload.role,
            "message": "Role updated successfully.",
        }

    new_user = {
        "firebase_uid": payload.firebase_uid,
        "email": payload.email,
        "role": payload.role,
        "created_at": datetime.now(timezone.utc),
    }

    result = await users_col.insert_one(new_user)
    logger.info("New user registered: %s role=%s", payload.email, payload.role)

    return {
        "user_id": str(result.inserted_id),
        "role": payload.role,
        "message": "User registered successfully.",
    }


@router.get(
    "/me",
    summary="Get current authenticated user",
    response_description="Current user's public profile",
)
async def get_me(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """
    Returns the authenticated user's MongoDB document.
    Requires a valid Firebase Bearer token in the Authorization header.
    """
    return {
        "user_id": current_user["_id"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user.get("created_at"),
    }
