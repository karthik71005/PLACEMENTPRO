"""
Alumni Router — Sprint 4

Endpoints for job referrals, mentorship slot management, and in-app notifications.
"""

import logging
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from core.dependencies import get_current_user, get_db, require_role
from models.alumni import JobReferralCreate, MentorshipSlotCreate
from services.alumni_service import post_job_referral, create_mentorship_slot, book_slot

router = APIRouter(prefix="/api/alumni", tags=["Alumni"])
logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# JOB REFERRALS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/jobs",
    summary="Post a job referral (alumni only)",
    dependencies=[Depends(require_role(["alumni"]))],
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("50/minute")
async def create_job(
    request: Request,
    payload: JobReferralCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    result = await post_job_referral(db, current_user["_id"], payload.model_dump())
    return result


from fastapi import APIRouter, Depends, status, Request, Query, HTTPException

@router.get(
    "/jobs",
    summary="List all job referrals (any authenticated user)",
)
@limiter.limit("100/minute")
async def list_jobs(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    cursor: str = Query(None, description="Cursor for pagination (ObjectId)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
):
    query: dict = {}
    if cursor:
        try:
            query["_id"] = {"$lt": ObjectId(cursor)}
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor format")

    db_cursor = db["job_referrals"].find(query).sort("_id", -1).limit(limit)
    jobs = []
    async for doc in db_cursor:
        doc["_id"] = str(doc["_id"])
        try:
            alumni_user = await db["users"].find_one({"_id": ObjectId(doc["alumni_id"])})
            doc["alumni_name"] = alumni_user.get("email", "").split("@")[0] if alumni_user else "Alumni"
        except Exception:
            doc["alumni_name"] = "Alumni"
        for key in ("posted_at",):
            if key in doc and hasattr(doc[key], "isoformat"):
                doc[key] = doc[key].isoformat()
        jobs.append(doc)

    next_cursor = jobs[-1]["_id"] if jobs else None
    return {"jobs": jobs, "count": len(jobs), "next_cursor": next_cursor}


# ═══════════════════════════════════════════════════════════════════════════════
# MENTORSHIP SLOTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/slots",
    summary="Create a mentorship slot (alumni only)",
    dependencies=[Depends(require_role(["alumni"]))],
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("50/minute")
async def create_slot(
    request: Request,
    payload: MentorshipSlotCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    result = await create_mentorship_slot(db, current_user["_id"], payload.model_dump())
    return result


@router.get(
    "/slots",
    summary="List mentorship slots (any authenticated user)",
)
@limiter.limit("100/minute")
async def list_slots(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Alumni: all their own slots.
    Students: all slots (booked and available) from all alumni.
    """
    role = current_user.get("role", "student")

    if role == "alumni":
        cursor = db["alumni_slots"].find({"alumni_id": current_user["_id"]}).sort("start_time", 1)
    else:
        cursor = db["alumni_slots"].find().sort("start_time", 1)

    slots = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        booked_list = doc.get("booked_students", [])
        max_cap = doc.get("max_students", 1)
        doc["booked_count"] = len(booked_list)
        doc["is_full"] = len(booked_list) >= max_cap
        doc["spots_left"] = max(0, max_cap - len(booked_list))

        # Check if current student already booked
        doc["already_booked"] = any(
            b.get("student_id") == current_user["_id"] for b in booked_list
        )

        # Only show meet_link to booked students or the alumni owner
        if role != "alumni" and not doc["already_booked"]:
            doc.pop("meet_link", None)

        # Get alumni name
        try:
            alumni_user = await db["users"].find_one({"_id": ObjectId(doc["alumni_id"])})
            doc["alumni_name"] = alumni_user.get("email", "").split("@")[0] if alumni_user else "Alumni"
        except Exception:
            doc["alumni_name"] = "Alumni"

        # Only expose booked_students list to alumni
        if role != "alumni":
            doc.pop("booked_students", None)

        for key in ("start_time", "end_time", "created_at", "booked_at"):
            if key in doc and hasattr(doc.get(key), "isoformat"):
                doc[key] = doc[key].isoformat()
        slots.append(doc)
    return {"slots": slots, "count": len(slots)}


@router.post(
    "/slots/{slot_id}/book",
    summary="Book a mentorship slot (student only)",
    dependencies=[Depends(require_role(["student"]))],
)
@limiter.limit("50/minute")
async def book_mentorship_slot(
    request: Request,
    slot_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    # Get student name for the notification
    student = await db["students"].find_one({"user_id": current_user["_id"]})
    student_name = student.get("full_name", current_user.get("email", "Student")) if student else "Student"

    result = await book_slot(db, slot_id, current_user["_id"], student_name)
    return {"message": "Slot booked successfully!", "slot": result}


# ═══════════════════════════════════════════════════════════════════════════════
# IN-APP NOTIFICATIONS (for alumni)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/notifications",
    summary="Get in-app notifications for current user",
)
@limiter.limit("100/minute")
async def get_notifications(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    cursor = db["app_notifications"].find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).limit(20)

    notifs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        for key in ("created_at",):
            if key in doc and hasattr(doc[key], "isoformat"):
                doc[key] = doc[key].isoformat()
        notifs.append(doc)

    unread = sum(1 for n in notifs if not n.get("read"))
    return {"notifications": notifs, "unread_count": unread}


@router.patch(
    "/notifications/read",
    summary="Mark all notifications as read",
)
@limiter.limit("50/minute")
async def mark_notifications_read(
    request: Request,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    result = await db["app_notifications"].update_many(
        {"user_id": current_user["_id"], "read": False},
        {"$set": {"read": True}},
    )
    return {"message": f"Marked {result.modified_count} notifications as read."}
