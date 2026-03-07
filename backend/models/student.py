from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator
import bleach

from models.user import PyObjectId


# ── Sub-models ────────────────────────────────────────────────────────────────
class AcademicDetails(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0, description="CGPA between 0.0 and 10.0")
    backlogs: int = Field(..., ge=0, description="Number of backlogs (non-negative)")


class Project(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    tech_stack: str = Field(..., min_length=1, max_length=300)
    link: str = Field(default="", max_length=500)

    @field_validator("title", "description", "tech_stack", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        if isinstance(v, str):
            return bleach.clean(v.strip(), tags=[], strip=True)
        return v


# ── Main Document Model ───────────────────────────────────────────────────────
class StudentModel(BaseModel):
    """Represents a student document in the `students` MongoDB collection."""

    id: PyObjectId | None = Field(default=None, alias="_id")
    user_id: str = Field(..., description="References users._id as string")
    full_name: str = Field(..., min_length=1, max_length=150)
    branch: str = Field(..., min_length=1, max_length=100)
    year_of_passing: int = Field(..., ge=2000, le=2100)
    academics: AcademicDetails
    skills: list[str] = Field(default_factory=list, max_length=50)
    projects: list[Project] = Field(default_factory=list, max_length=20)
    resume_url: str = Field(default="")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("skills", mode="before")
    @classmethod
    def validate_skills(cls, v: list) -> list[str]:
        cleaned = [s.strip().lower() for s in v if isinstance(s, str) and s.strip()]
        seen = set()
        deduped = []
        for s in cleaned:
            if s not in seen:
                seen.add(s)
                deduped.append(s)
        return deduped

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str, datetime: lambda dt: dt.isoformat()},
    }


# ── Request / Response Schemas ────────────────────────────────────────────────
class StudentUpdateSchema(BaseModel):
    """Body for PUT /api/students/profile"""

    full_name: str = Field(..., min_length=1, max_length=150)
    branch: str = Field(..., min_length=1, max_length=100)
    year_of_passing: int = Field(..., ge=2000, le=2100)
    academics: AcademicDetails
    skills: list[str] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    resume_url: str = Field(default="")

    @field_validator("skills", mode="before")
    @classmethod
    def validate_skills(cls, v: list) -> list[str]:
        cleaned = [s.strip().lower() for s in v if isinstance(s, str) and s.strip()]
        seen: set[str] = set()
        deduped = []
        for s in cleaned:
            if s not in seen:
                seen.add(s)
                deduped.append(s)
        return deduped[:50]

    @field_validator("projects", mode="before")
    @classmethod
    def limit_projects(cls, v: list) -> list:
        return v[:20]
