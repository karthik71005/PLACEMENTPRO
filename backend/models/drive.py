from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator
import bleach

from models.user import PyObjectId

DriveStatus = Literal["Active", "Closed", "Upcoming"]


# ── Sub-models ────────────────────────────────────────────────────────────────
class EligibilityCriteria(BaseModel):
    min_cgpa: float = Field(..., ge=0.0, le=10.0)
    max_backlogs: int = Field(..., ge=0)
    branches: list[str] = Field(
        ...,
        min_length=1,
        description="List of eligible branch names, e.g. ['CSE', 'ISE', 'ECE']",
    )

    @field_validator("branches", mode="before")
    @classmethod
    def normalize_branches(cls, v: list) -> list[str]:
        return [b.strip().upper() for b in v if isinstance(b, str) and b.strip()]


# ── Main Document Model ───────────────────────────────────────────────────────
class DriveModel(BaseModel):
    """Represents a drive document in the `company_drives` MongoDB collection."""

    id: PyObjectId | None = Field(default=None, alias="_id")
    tpo_id: str = Field(..., description="References users._id of the TPO")
    company_name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    eligibility_criteria: EligibilityCriteria
    status: DriveStatus = Field(default="Upcoming")
    drive_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str, datetime: lambda dt: dt.isoformat()},
    }


# ── Request / Response Schemas ────────────────────────────────────────────────
class DriveCreateSchema(BaseModel):
    """Body for POST /api/drives"""

    company_name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    eligibility_criteria: EligibilityCriteria
    status: DriveStatus = Field(default="Upcoming")
    drive_date: datetime
    published: bool = Field(default=False, description="Whether students can see this drive in their feed")

    @field_validator("drive_date", mode="before")
    @classmethod
    def drive_date_must_be_future(cls, v) -> datetime:
        if isinstance(v, str):
            v = datetime.fromisoformat(v)
        # Make timezone-aware if naive
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= datetime.now(timezone.utc):
            raise ValueError("Drive date must be in the future.")
        return v

    @field_validator("description", "company_name", "role", mode="before")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        if isinstance(v, str):
            return bleach.clean(v, tags=[], strip=True)
        return v


class DrivePublicSchema(BaseModel):
    """Safe public response schema for drives."""

    id: str
    company_name: str
    role: str
    description: str
    eligibility_criteria: EligibilityCriteria
    status: DriveStatus
    drive_date: datetime
    created_at: datetime

    model_config = {
        "json_encoders": {datetime: lambda dt: dt.isoformat()},
    }
