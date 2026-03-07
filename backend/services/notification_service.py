"""
Notification Service — Sprint 3

Broadcasts placement drive information to eligible students via n8n webhook.
n8n handles the actual email delivery using its built-in Email (SMTP) node,
sending from the TPO's configured email address.

Flow:
  1. Backend collects student emails + drive info
  2. POSTs payload to N8N_WEBHOOK_URL
  3. n8n loops through students and sends email to each
  4. Backend logs the notification dispatch to `notifications_log` collection
"""

import logging
from datetime import datetime, timezone

import httpx

from core.config import settings

logger = logging.getLogger(__name__)

# Timeout for the n8n webhook call (seconds)
N8N_TIMEOUT = 15.0


async def broadcast_notification(
    db,
    drive_id: str,
    student_ids: list[str],
) -> dict:
    """
    Fetch student emails and drive info, POST to n8n webhook,
    and log the result in notifications_log.

    Returns:
        dict with status, count, and notification_log_id
    """
    from bson import ObjectId

    # ── Fetch drive info ──────────────────────────────────────────────────────
    try:
        drive = await db["company_drives"].find_one({"_id": ObjectId(drive_id)})
    except Exception:
        drive = None

    if not drive:
        raise ValueError(f"Drive {drive_id} not found.")

    drive_info = {
        "company_name": drive.get("company_name", ""),
        "role": drive.get("role", ""),
        "drive_date": drive.get("drive_date", "").isoformat()
        if isinstance(drive.get("drive_date"), datetime)
        else str(drive.get("drive_date", "")),
        "description": drive.get("description", ""),
    }

    # ── Fetch student profiles (student_ids are from the `students` collection) ─
    student_oids = [ObjectId(sid) if ObjectId.is_valid(sid) else sid for sid in student_ids]

    # Step 1: Get user_id and full_name from `students` collection
    profiles_cursor = db["students"].find(
        {"_id": {"$in": student_oids}},
        {"user_id": 1, "full_name": 1, "_id": 1},
    )
    profiles = []
    user_id_to_name = {}
    user_ids = []
    async for p in profiles_cursor:
        uid = p.get("user_id", "")
        user_ids.append(uid)
        user_id_to_name[uid] = p.get("full_name", "")
        profiles.append(p)

    # Step 2: Get emails from `users` collection using user_ids
    user_oids = [ObjectId(uid) if ObjectId.is_valid(uid) else uid for uid in user_ids]
    users_cursor = db["users"].find(
        {"_id": {"$in": user_oids}},
        {"email": 1, "_id": 1},
    )
    students = []
    async for u in users_cursor:
        uid_str = str(u["_id"])
        students.append({
            "email": u.get("email", ""),
            "student_id": uid_str,
            "name": user_id_to_name.get(uid_str, u.get("email", "").split("@")[0]),
        })


    if not students:
        logger.warning("No students found for broadcast. drive_id=%s", drive_id)
        # Still log even if no students found
        log_doc = {
            "drive_id": drive_id,
            "student_ids": student_ids,
            "channels": ["email"],
            "sent_at": datetime.now(timezone.utc),
            "status": "failed",
            "error": "No student emails found",
        }
        await db["notifications_log"].insert_one(log_doc)
        return {"status": "failed", "count": 0, "error": "No student emails found"}

    # ── Build n8n payload ─────────────────────────────────────────────────────
    payload = {
        "students": students,
        "drive": drive_info,
    }

    # ── POST to n8n webhook ───────────────────────────────────────────────────
    webhook_url = settings.n8n_webhook_url
    dispatch_status = "dispatched"
    error_msg = None

    if not webhook_url:
        logger.warning("N8N_WEBHOOK_URL not configured — notification logged but not sent.")
        dispatch_status = "failed"
        error_msg = "N8N_WEBHOOK_URL not configured"
    else:
        try:
            async with httpx.AsyncClient(timeout=N8N_TIMEOUT) as client:
                resp = await client.post(webhook_url, json=payload)
                if resp.status_code >= 400:
                    dispatch_status = "partial"
                    error_msg = f"n8n returned {resp.status_code}"
                    logger.warning("n8n webhook returned %s for drive %s", resp.status_code, drive_id)
                else:
                    logger.info(
                        "n8n broadcast dispatched: drive=%s students=%d",
                        drive_id,
                        len(students),
                    )
        except httpx.TimeoutException:
            dispatch_status = "partial"
            error_msg = "n8n webhook timed out"
            logger.warning("n8n webhook timed out for drive %s — retrying once", drive_id)
            # Retry once with 3s delay
            try:
                import asyncio
                await asyncio.sleep(3)
                async with httpx.AsyncClient(timeout=N8N_TIMEOUT) as client:
                    resp = await client.post(webhook_url, json=payload)
                    if resp.status_code < 400:
                        dispatch_status = "dispatched"
                        error_msg = None
            except Exception:
                pass  # Keep partial status
        except Exception as exc:
            dispatch_status = "failed"
            error_msg = str(exc)
            logger.error("n8n webhook failed for drive %s: %s", drive_id, exc)

    # ── Log to notifications_log ──────────────────────────────────────────────
    log_doc = {
        "drive_id": drive_id,
        "student_ids": student_ids,
        "channels": ["email"],
        "sent_at": datetime.now(timezone.utc),
        "status": dispatch_status,
        "student_count": len(students),
    }
    if error_msg:
        log_doc["error"] = error_msg

    result = await db["notifications_log"].insert_one(log_doc)

    return {
        "status": dispatch_status,
        "count": len(students),
        "notification_log_id": str(result.inserted_id),
    }
