import logging

from bson import ObjectId
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


async def filter_eligible_students(db, drive_id: str) -> dict:
    """
    Run the Criteria Engine aggregation against the `students` collection.

    Matches students who meet ALL of the drive's eligibility criteria:
      - CGPA >= min_cgpa
      - Backlogs <= max_backlogs
      - Branch in branches[]

    Returns:
        {
            "eligible_count": int,
            "students": [{"id", "full_name", "branch", "cgpa", "backlogs"}]
        }
    """
    # Fetch drive
    drive = await db["company_drives"].find_one({"_id": ObjectId(drive_id)})
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drive {drive_id} not found.",
        )

    criteria = drive.get("eligibility_criteria", {})
    min_cgpa = criteria.get("min_cgpa", 0.0)
    max_backlogs = criteria.get("max_backlogs", 999)
    branches = criteria.get("branches", [])

    # Build match stage — branch match is case-insensitive via $in on normalized values
    match_stage = {
        "academics.cgpa": {"$gte": min_cgpa},
        "academics.backlogs": {"$lte": max_backlogs},
    }
    if branches:
        # Normalize to uppercase for consistent comparison
        normalized_branches = [b.upper() for b in branches]
        match_stage["branch"] = {"$in": normalized_branches}

    pipeline = [
        {"$match": match_stage},
        {
            "$project": {
                "_id": 1,
                "full_name": 1,
                "branch": 1,
                "cgpa": "$academics.cgpa",
                "backlogs": "$academics.backlogs",
            }
        },
        {"$sort": {"cgpa": -1}},  # Best CGPA first
    ]

    cursor = db["students"].aggregate(pipeline)
    eligible = []
    async for doc in cursor:
        eligible.append(
            {
                "id": str(doc["_id"]),
                "full_name": doc.get("full_name", ""),
                "branch": doc.get("branch", ""),
                "cgpa": doc.get("cgpa", 0),
                "backlogs": doc.get("backlogs", 0),
            }
        )

    logger.info(
        "Criteria Engine: drive=%s eligible=%d (min_cgpa=%.1f, max_backlogs=%d, branches=%s)",
        drive_id,
        len(eligible),
        min_cgpa,
        max_backlogs,
        branches,
    )

    return {
        "eligible_count": len(eligible),
        "students": eligible,
    }


async def get_eligible_drives_for_student(db, student_id: str) -> list[dict]:
    """
    Return all Active drives where the student meets the eligibility criteria.
    Used for GET /api/students/feed.
    """
    # Fetch student profile
    student = await db["students"].find_one({"user_id": student_id})
    if not student:
        return []

    cgpa = student.get("academics", {}).get("cgpa", 0)
    backlogs = student.get("academics", {}).get("backlogs", 0)
    branch = (student.get("branch") or "").upper()

    # Find active AND published drives where student meets all criteria
    cursor = db["company_drives"].find(
        {
            "status": "Active",
            "published": True,
            "eligibility_criteria.min_cgpa": {"$lte": cgpa},
            "eligibility_criteria.max_backlogs": {"$gte": backlogs},
            "eligibility_criteria.branches": branch,
        }
    )

    drives = []
    async for drive in cursor:
        drive["_id"] = str(drive["_id"])
        drives.append(drive)

    return drives
