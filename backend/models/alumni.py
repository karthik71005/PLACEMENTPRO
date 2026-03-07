"""
Pydantic schemas for Alumni features — Sprint 4
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator
import bleach


# ── Job Referrals ─────────────────────────────────────────────────────────────
class JobReferralCreate(BaseModel):
    company: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    location: str = Field("", max_length=100)
    job_link: str = Field("", max_length=500)
    referral_notes: str = Field("", max_length=1000)

    @field_validator("company", "role", "location", "referral_notes", mode="before")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        if isinstance(v, str):
            return bleach.clean(v, tags=[], strip=True)
        return v


# ── Mentorship Slots ─────────────────────────────────────────────────────────
class MentorshipSlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    session_type: str = Field("Mock Interview", max_length=50)
    max_students: int = Field(1, ge=1, le=50)
    meet_link: str = Field("", max_length=500)
