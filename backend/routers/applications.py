import logging
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request

from core.dependencies import get_current_user, get_db, require_role
from models.application import ApplicationCreateSchema, ApplicationStatusUpdate
from services.application_service import apply_to_drive
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/applications", tags=["Applications"])
logger = logging.getLogger(__name__)


@router.post(
    "",
    summary="Apply to a drive",
    dependencies=[Depends(require_role(["student"]))],
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("50/minute")
async def apply(
    request: Request,
    payload: ApplicationCreateSchema,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Apply the authenticated student to a drive. Returns 409 if already applied."""
    result = await apply_to_drive(db, current_user["_id"], payload.drive_id)
    return result


@router.get(
    "/drive/{drive_id}",
    summary="List all applications for a drive (TPO only)",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("100/minute")
async def list_drive_applications(
    request: Request,
    drive_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """TPO only: list all student applications for a specific drive, with student details."""
    cursor = db["applications"].find({"drive_id": drive_id}).sort("applied_on", -1)

    applications = []
    async for app in cursor:
        # Get student profile
        student = await db["students"].find_one({"user_id": app["student_id"]})
        # Get user email
        try:
            user = await db["users"].find_one({"_id": ObjectId(app["student_id"])})
        except Exception:
            user = None

        applications.append({
            "_id": str(app["_id"]),
            "student_id": app["student_id"],
            "drive_id": app["drive_id"],
            "status": app.get("status", "Applied"),
            "applied_on": app.get("applied_on", "").isoformat() if hasattr(app.get("applied_on", ""), "isoformat") else str(app.get("applied_on", "")),
            "student_name": student.get("full_name", "Unknown") if student else "Unknown",
            "student_branch": student.get("branch", "") if student else "",
            "student_cgpa": student.get("academics", {}).get("cgpa", 0) if student else 0,
            "student_email": user.get("email", "") if user else "",
        })

    return {"applications": applications, "count": len(applications)}


@router.patch(
    "/{application_id}/status",
    summary="Update application status (TPO only)",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("100/minute")
async def update_application_status(
    request: Request,
    application_id: str,
    payload: ApplicationStatusUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    TPO only: update an application's status (Applied → Shortlisted → Selected / Rejected).
    Also writes the update to Firebase Realtime Database for live student tracker sync.
    """
    try:
        oid = ObjectId(application_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid application ID.")

    now = datetime.now(timezone.utc)
    result = await db["applications"].find_one_and_update(
        {"_id": oid},
        {"$set": {"status": payload.status, "updated_at": now}},
        return_document=True,
    )

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    logger.info(
        "Application %s status updated to %s by tpo=%s",
        application_id,
        payload.status,
        current_user["_id"],
    )

    # ── Write to Firebase Realtime DB for live tracker sync ────────────────
    try:
        from firebase_admin import db as firebase_db
        ref = firebase_db.reference(f"/application_updates/{application_id}")
        ref.set({
            "status": payload.status,
            "updated_at": now.isoformat(),
        })
        logger.info("Firebase RTDB updated for application %s", application_id)
    except Exception as exc:
        # Don't fail the request if Firebase write fails — it's a best-effort sync
        logger.warning("Firebase RTDB write failed for %s: %s", application_id, exc)

    return {
        "application_id": application_id,
        "status": payload.status,
        "updated_at": now.isoformat(),
        "message": f"Status updated to {payload.status}.",
    }
