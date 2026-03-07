from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, Field

from models.user import PyObjectId

ApplicationStatus = Literal["Applied", "Shortlisted", "Selected", "Rejected"]


class ApplicationModel(BaseModel):
    """Represents an application document in the `applications` MongoDB collection."""

    id: PyObjectId | None = Field(default=None, alias="_id")
    student_id: str = Field(..., description="References users._id of the student")
    drive_id: str = Field(..., description="References company_drives._id")
    status: ApplicationStatus = Field(default="Applied")
    applied_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str, datetime: lambda dt: dt.isoformat()},
    }


class ApplicationCreateSchema(BaseModel):
    """Body for POST /api/applications"""

    drive_id: str = Field(..., description="ID of the drive to apply for")


class ApplicationStatusUpdate(BaseModel):
    """Body for PATCH /api/applications/{id}/status (Sprint 3)"""

    status: ApplicationStatus
