import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


async def apply_to_drive(db, student_id: str, drive_id: str) -> dict:
    """
    Insert a new application document.

    Raises:
        409 HTTPException if student has already applied to this drive.
        404 HTTPException if the drive does not exist.
    """
    # Verify drive exists
    drive = await db["company_drives"].find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drive {drive_id} not found.",
        )

    # Check for duplicate application
    existing = await db["applications"].find_one(
        {"student_id": student_id, "drive_id": drive_id}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this drive.",
        )

    now = datetime.now(timezone.utc)
    application = {
        "student_id": student_id,
        "drive_id": drive_id,
        "status": "Applied",
        "applied_on": now,
        "updated_at": now,
    }

    result = await db["applications"].insert_one(application)
    logger.info("New application: student=%s drive=%s", student_id, drive_id)

    return {
        "application_id": str(result.inserted_id),
        "status": "Applied",
        "applied_on": now.isoformat(),
    }


async def update_application_status(
    db, application_id: str, new_status: str
) -> dict:
    """
    Update the status of an existing application.

    Raises:
        404 HTTPException if the application does not exist.
    """
    now = datetime.now(timezone.utc)
    result = await db["applications"].find_one_and_update(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": new_status, "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {application_id} not found.",
        )

    result["_id"] = str(result["_id"])
    logger.info("Application %s status updated → %s", application_id, new_status)
    return result
