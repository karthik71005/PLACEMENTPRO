from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, Field

from models.user import PyObjectId

NotificationStatus = Literal["dispatched", "failed", "partial"]


class NotificationLogModel(BaseModel):
    """Represents a notification log document in the `notifications_log` collection."""

    id: PyObjectId | None = Field(default=None, alias="_id")
    drive_id: str = Field(..., description="References company_drives._id")
    student_ids: list[str] = Field(default_factory=list)
    channels: list[str] = Field(default_factory=lambda: ["email"])
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: NotificationStatus = Field(default="dispatched")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str, datetime: lambda dt: dt.isoformat()},
    }


class BroadcastRequest(BaseModel):
    """Body for POST /api/notifications/broadcast"""

    drive_id: str = Field(..., description="ID of the drive to notify about")
    student_ids: list[str] = Field(..., min_length=1, description="list of student user_ids to notify")
