import logging
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel

from core.dependencies import get_current_user, get_db, require_role
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])
logger = logging.getLogger(__name__)


class InterviewCreate(BaseModel):
    drive_id: str
    student_id: str
    student_name: str
    student_branch: str = ""
    student_cgpa: float = 0
    day: str          # "Mon", "Tue", etc.
    hour: int         # 9–18


class InterviewDelete(BaseModel):
    interview_id: str


# ── GET /api/interviews?drive_id=xxx ─────────────────────────────────────────
@router.get(
    "",
    summary="List scheduled interviews for a drive (TPO only)",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("100/minute")
async def list_interviews(
    request: Request,
    drive_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    cursor = db["interviews"].find({"drive_id": drive_id}).sort("hour", 1)
    interviews = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc.pop("created_at", None)
        interviews.append(doc)
    return {"interviews": interviews, "count": len(interviews)}


# ── POST /api/interviews ─────────────────────────────────────────────────────
@router.post(
    "",
    summary="Schedule an interview slot (TPO only)",
    dependencies=[Depends(require_role(["tpo"]))],
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("100/minute")
async def create_interview(
    request: Request,
    payload: InterviewCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    # Check for conflicts (same drive, same day+hour)
    conflict = await db["interviews"].find_one({
        "drive_id": payload.drive_id,
        "day": payload.day,
        "hour": payload.hour,
    })
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Slot {payload.day} {payload.hour}:00 is already booked.",
        )

    # Ensure student has applied to the drive
    application = await db["applications"].find_one({
        "drive_id": payload.drive_id,
        "student_id": payload.student_id,
    })
    if not application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot schedule: student {payload.student_name} has not applied for this drive.",
        )

    doc = payload.model_dump()
    doc["tpo_id"] = current_user["_id"]
    doc["created_at"] = datetime.now(timezone.utc)

    result = await db["interviews"].insert_one(doc)
    logger.info(
        "Interview scheduled: student=%s drive=%s %s %d:00",
        payload.student_name, payload.drive_id, payload.day, payload.hour,
    )
    # doc now has _id (ObjectId) from insert — remove it before returning
    doc.pop("_id", None)
    created = doc.pop("created_at", None)
    return {
        "_id": str(result.inserted_id),
        **doc,
        "created_at": created.isoformat() if created else None,
    }


# ── DELETE /api/interviews/{interview_id} ────────────────────────────────────
@router.delete(
    "/{interview_id}",
    summary="Remove a scheduled interview (TPO only)",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("50/minute")
async def delete_interview(
    request: Request,
    interview_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    try:
        oid = ObjectId(interview_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID.")

    result = await db["interviews"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found.")

    logger.info("Interview %s deleted by tpo=%s", interview_id, current_user["_id"])
    return {"message": "Interview removed."}


# ── DELETE /api/interviews/drive/{drive_id} ——————————————————————————————————
@router.delete(
    "/drive/{drive_id}",
    summary="Clear all interviews for a drive (TPO only)",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("10/minute")
async def clear_drive_interviews(
    request: Request,
    drive_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    result = await db["interviews"].delete_many({"drive_id": drive_id})
    logger.info("Cleared %d interviews for drive %s", result.deleted_count, drive_id)
    return {"message": f"Cleared {result.deleted_count} interviews.", "deleted": result.deleted_count}
