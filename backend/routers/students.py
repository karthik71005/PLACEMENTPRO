import logging
from datetime import datetime
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from core.dependencies import get_current_user, get_db, require_role
from models.student import StudentUpdateSchema
from services.criteria_engine import get_eligible_drives_for_student
from core.cache import cache_get, cache_set

router = APIRouter(prefix="/api/students", tags=["Students"])
logger = logging.getLogger(__name__)


def serialize_doc(doc: dict) -> dict:
    """Recursively convert ObjectId and datetime to JSON-safe types."""
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_doc(i) if isinstance(i, dict) else
                str(i) if isinstance(i, ObjectId) else
                i.isoformat() if isinstance(i, datetime) else i
                for i in value
            ]
        else:
            result[key] = value
    return result


# ── PUT /api/students/profile ─────────────────────────────────────────────────
@router.put(
    "/profile",
    summary="Upsert student profile",
    dependencies=[Depends(require_role(["student"]))],
    status_code=status.HTTP_200_OK,
)
@limiter.limit("50/minute")
async def upsert_student_profile(
    request: Request,
    payload: StudentUpdateSchema,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Create or update the authenticated student's profile.
    Uses user_id from the JWT, not from the request body.
    """
    student_user_id = current_user["_id"]
    update_doc = payload.model_dump()
    update_doc["user_id"] = student_user_id

    result = await db["students"].find_one_and_update(
        {"user_id": student_user_id},
        {"$set": update_doc},
        upsert=True,
        return_document=True,
    )

    profile = serialize_doc(result) if result else None
    logger.info("Student profile upserted for user_id=%s", student_user_id)
    return {"message": "Profile saved successfully.", "profile": profile}


# ── GET /api/students/feed ────────────────────────────────────────────────────
@router.get(
    "/feed",
    summary="Get eligibility-filtered drive feed",
    dependencies=[Depends(require_role(["student"]))],
)
@limiter.limit("100/minute")
async def get_student_feed(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Returns all Active drives that the authenticated student is eligible for,
    based on their stored CGPA, backlogs, and branch.
    """
    cache_key = f"feed:{current_user['_id']}"
    cached_feed = await cache_get(cache_key)
    if cached_feed:
        logger.info("Student feed served from cache for user %s", current_user["_id"])
        return cached_feed

    drives = await get_eligible_drives_for_student(db, current_user["_id"])

    # Attach application status for each drive
    applied_drive_ids: set[str] = set()
    applications_cursor = db["applications"].find(
        {"student_id": current_user["_id"]},
        {"drive_id": 1, "status": 1},
    )
    async for app in applications_cursor:
        applied_drive_ids.add(app["drive_id"])

    # Serialize each drive and tag applied ones
    serialized = []
    for drive in drives:
        d = serialize_doc(drive)
        d["has_applied"] = d.get("_id") in applied_drive_ids
        serialized.append(d)

    response_data = {"drives": serialized, "count": len(serialized)}
    await cache_set(cache_key, response_data, ttl_seconds=60)
    return response_data


# ── GET /api/students/tracker ─────────────────────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query

@router.get(
    "/tracker",
    summary="Get student's application tracker",
    dependencies=[Depends(require_role(["student"]))],
)
@limiter.limit("100/minute")
async def get_tracker(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    cursor: str = Query(None, description="Cursor for pagination (ObjectId)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
):
    """
    Returns all applications for the authenticated student,
    with drive information embedded in each result.
    """
    query: dict = {"student_id": current_user["_id"]}
    if cursor:
        try:
            query["_id"] = {"$lt": ObjectId(cursor)}
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor format")

    db_cursor = db["applications"].find(query).sort("_id", -1).limit(limit)
    applications = []
    async for app in db_cursor:
        app = serialize_doc(app)
        # Populate drive info
        drive_id = app.get("drive_id")
        if drive_id:
            try:
                drive = await db["company_drives"].find_one(
                    {"_id": ObjectId(drive_id)},
                    {"company_name": 1, "role": 1, "drive_date": 1, "status": 1},
                )
                if drive:
                    app["drive"] = serialize_doc(drive)
            except Exception:
                app["drive"] = None
        applications.append(app)

    next_cursor = applications[-1]["_id"] if applications else None
    return {"applications": applications, "count": len(applications), "next_cursor": next_cursor}


# ── GET /api/students/me ──────────────────────────────────────────────────────
@router.get(
    "/me",
    summary="Get own student profile",
    dependencies=[Depends(require_role(["student"]))],
)
@limiter.limit("100/minute")
async def get_my_profile(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Returns the authenticated student's own profile. 404 if not yet created."""
    student = await db["students"].find_one({"user_id": current_user["_id"]})
    if not student:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete the Resume Wizard.",
        )
    return serialize_doc(student)


# ── GET /api/students/{student_id} ────────────────────────────────────────────
@router.get(
    "/{student_id}",
    summary="Get student profile by ID",
    dependencies=[Depends(require_role(["student", "tpo"]))],
)
@limiter.limit("100/minute")
async def get_student_profile(
    request: Request,
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Students can only fetch their own profile.
    TPOs can fetch any student profile.
    """
    # Student can only view their own profile
    if current_user["role"] == "student" and current_user["_id"] != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile.",
        )

    student = await db["students"].find_one({"user_id": student_id})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    return serialize_doc(student)
