from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field


# ── ObjectId helper ───────────────────────────────────────────────────────────
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId: {v}")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema


# ── MongoDB Document Model ────────────────────────────────────────────────────
class UserModel(BaseModel):
    """Represents a user document stored in the `users` MongoDB collection."""

    id: PyObjectId | None = Field(default=None, alias="_id")
    firebase_uid: str = Field(..., description="UID from Firebase Authentication")
    email: EmailStr
    role: Literal["tpo", "student", "alumni"]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str, datetime: lambda dt: dt.isoformat()},
        "json_schema_extra": {
            "example": {
                "firebase_uid": "abc123uid",
                "email": "student@sahyadri.edu.in",
                "role": "student",
            }
        },
    }


# ── Request / Response Schemas ────────────────────────────────────────────────
class UserCreateSchema(BaseModel):
    """Payload sent to POST /auth/verify to register a user."""

    firebase_uid: str
    email: EmailStr
    role: Literal["tpo", "student", "alumni"]


class UserPublicSchema(BaseModel):
    """Safe public response — never exposes firebase_uid directly."""

    id: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = {
        "json_encoders": {datetime: lambda dt: dt.isoformat()},
    }
