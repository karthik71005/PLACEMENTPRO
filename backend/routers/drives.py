import logging
from datetime import datetime
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from core.dependencies import get_current_user, get_db, require_role
from models.drive import DriveCreateSchema
from services.criteria_engine import filter_eligible_students
from core.cache import cache_get, cache_set

router = APIRouter(prefix="/api/drives", tags=["Drives"])
logger = logging.getLogger(__name__)


def serialize_doc(doc: dict) -> dict:
    """Convert ObjectId and datetime fields to JSON-serializable types."""
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


# ── POST /api/drives ──────────────────────────────────────────────────────────
@router.post(
    "",
    summary="Create a new placement drive",
    dependencies=[Depends(require_role(["tpo"]))],
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("100/minute")
async def create_drive(
    request: Request,
    payload: DriveCreateSchema,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """TPO only: create a new company drive."""
    from datetime import timezone

    doc = payload.model_dump()
    doc["tpo_id"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)

    result = await db["company_drives"].insert_one(doc)
    logger.info(
        "Drive created: company=%s role=%s by tpo=%s",
        payload.company_name,
        payload.role,
        current_user["_id"],
    )

    return {
        "message": "Drive created successfully.",
        "drive_id": str(result.inserted_id),
    }


# ── GET /api/drives ───────────────────────────────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query

@router.get(
    "",
    summary="List drives (role-aware filter)",
)
@limiter.limit("100/minute")
async def list_drives(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    cursor: str = Query(None, description="Cursor for pagination (ObjectId)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
):
    """
    - Students: only Active drives returned.
    - TPOs / Alumni: all drives returned.
    """
    query: dict = {}
    if current_user["role"] == "student":
        query["status"] = "Active"
        
    if cursor:
        try:
            query["_id"] = {"$lt": ObjectId(cursor)}
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor format")

    db_cursor = db["company_drives"].find(query).sort("_id", -1).limit(limit)
    drives = []
    async for drive in db_cursor:
        drives.append(serialize_doc(drive))

    next_cursor = drives[-1]["_id"] if drives else None

    return {"drives": drives, "count": len(drives), "next_cursor": next_cursor}


# ── GET /api/drives/{drive_id} ────────────────────────────────────────────────
@router.get(
    "/{drive_id}",
    summary="Get a single drive by ID",
)
@limiter.limit("100/minute")
async def get_drive(
    request: Request,
    drive_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Fetch a single drive. Any authenticated user can call this."""
    try:
        oid = ObjectId(drive_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid drive ID format.",
        )

    drive = await db["company_drives"].find_one({"_id": oid})
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drive not found.",
        )

    return serialize_doc(drive)


# ── POST /api/drives/{drive_id}/filter ───────────────────────────────────────
@router.post(
    "/{drive_id}/filter",
    summary="Run Criteria Engine for a drive",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("100/minute")
async def run_criteria_filter(
    request: Request,
    drive_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    TPO only: run the Criteria Engine aggregation and return the list
    of eligible students for the given drive.
    """
    cache_key = f"drive_filter:{drive_id}"
    cached_result = await cache_get(cache_key)
    if cached_result:
        return cached_result

    try:
        result = await filter_eligible_students(db, drive_id)
        await cache_set(cache_key, result, ttl_seconds=300)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Criteria Engine error for drive %s: %s", drive_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Criteria Engine encountered an internal error.",
        )

    return result


# ── PATCH /api/drives/{drive_id}/publish ──────────────────────────────────────
@router.patch(
    "/{drive_id}/publish",
    summary="Toggle drive visibility for students",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("100/minute")
async def toggle_publish(
    request: Request,
    drive_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """TPO only: publish or unpublish a drive. Students only see published drives."""
    try:
        oid = ObjectId(drive_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid drive ID.")

    drive = await db["company_drives"].find_one({"_id": oid})
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drive not found.")

    new_val = not drive.get("published", False)
    await db["company_drives"].update_one({"_id": oid}, {"$set": {"published": new_val}})
    logger.info("Drive %s published=%s by tpo=%s", drive_id, new_val, current_user["_id"])

    return {"drive_id": drive_id, "published": new_val}
