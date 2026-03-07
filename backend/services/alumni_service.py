"""
Alumni Service — Sprint 4

Handles job referral posting, mentorship slot creation, and multi-student slot booking.
"""

import logging
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


async def post_job_referral(db, alumni_id: str, job_data: dict) -> dict:
    """Insert a new job referral posted by an alumni."""
    doc = {
        "alumni_id": alumni_id,
        "company": job_data["company"],
        "role": job_data["role"],
        "location": job_data.get("location", ""),
        "job_link": job_data.get("job_link", ""),
        "referral_notes": job_data.get("referral_notes", ""),
        "posted_at": datetime.now(timezone.utc),
    }
    result = await db["job_referrals"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["posted_at"] = doc["posted_at"].isoformat()
    logger.info("Job referral posted: %s at %s by alumni=%s", doc["role"], doc["company"], alumni_id)
    return doc


async def create_mentorship_slot(db, alumni_id: str, slot_data: dict) -> dict:
    """Create a mentorship slot with capacity and optional Meet link."""
    start = slot_data["start_time"]
    end = slot_data["end_time"]

    if end <= start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_time must be after start_time.",
        )

    # Check for overlapping slots
    overlap = await db["alumni_slots"].find_one({
        "alumni_id": alumni_id,
        "$or": [
            {"start_time": {"$lt": end}, "end_time": {"$gt": start}},
        ],
    })
    if overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot overlaps with an existing slot.",
        )

    doc = {
        "alumni_id": alumni_id,
        "start_time": start,
        "end_time": end,
        "session_type": slot_data.get("session_type", "Mock Interview"),
        "max_students": slot_data.get("max_students", 1),
        "meet_link": slot_data.get("meet_link", ""),
        "booked_students": [],   # [{student_id, student_name, booked_at}]
        "created_at": datetime.now(timezone.utc),
    }
    result = await db["alumni_slots"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    for key in ("start_time", "end_time", "created_at"):
        if hasattr(doc[key], "isoformat"):
            doc[key] = doc[key].isoformat()
    logger.info("Mentorship slot created: %s → %s (max %d) by alumni=%s",
                start, end, doc["max_students"], alumni_id)
    return doc


async def book_slot(db, slot_id: str, student_id: str, student_name: str) -> dict:
    """
    Atomic slot booking — allows multiple students up to max_students.
    Returns 409 if full or already booked by this student.
    """
    try:
        oid = ObjectId(slot_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slot ID.")

    # Fetch current slot
    slot = await db["alumni_slots"].find_one({"_id": oid})
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found.")

    max_cap = slot.get("max_students", 1)
    booked = slot.get("booked_students", [])

    # Check if student already booked
    if any(b["student_id"] == student_id for b in booked):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already booked this slot.",
        )

    # Check if full
    if len(booked) >= max_cap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot is fully booked.",
        )

    # Atomic update: push into booked_students only if count < max
    booking_entry = {
        "student_id": student_id,
        "student_name": student_name,
        "booked_at": datetime.now(timezone.utc).isoformat(),
    }

    result = await db["alumni_slots"].find_one_and_update(
        {
            "_id": oid,
            "booked_students.student_id": {"$ne": student_id},
            f"booked_students.{max_cap - 1}": {"$exists": False},  # ensures array < max
        },
        {"$push": {"booked_students": booking_entry}},
        return_document=True,
    )

    if not result:
        # It either got filled by someone else, OR the student double-clicked.
        # Check if they actually double-clicked implicitly:
        check_again = await db["alumni_slots"].find_one({"_id": oid, "booked_students.student_id": student_id})
        if check_again:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already booked this slot.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot was just filled by another student.",
        )

    # ── Create in-app notification for the alumni ──────────────────────────
    spots_left = max_cap - len(result.get("booked_students", []))
    notif_doc = {
        "user_id": slot["alumni_id"],
        "type": "slot_booking",
        "title": "New Slot Booking!",
        "message": f"{student_name} booked your {slot.get('session_type', 'session')} slot. {spots_left} spot{'s' if spots_left != 1 else ''} left.",
        "read": False,
        "slot_id": slot_id,
        "created_at": datetime.now(timezone.utc),
    }
    if spots_left == 0:
        notif_doc["message"] = f"{student_name} booked your last spot! Slot is now full ({max_cap}/{max_cap})."
    await db["app_notifications"].insert_one(notif_doc)

    logger.info("Slot %s booked by %s (%d/%d)", slot_id, student_name, len(result["booked_students"]), max_cap)

    # Serialize for response
    result["_id"] = str(result["_id"])
    for key in ("start_time", "end_time", "created_at"):
        if key in result and hasattr(result.get(key), "isoformat"):
            result[key] = result[key].isoformat()
    return result
