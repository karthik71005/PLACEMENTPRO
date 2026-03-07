from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from typing import Annotated
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from core.dependencies import get_current_user, require_role, get_db
from services.ai.skill_gap import SkillGapAnalyzer, SkillGapResult
from core.cache import cache_get, cache_set

router = APIRouter(prefix="/api/ai", tags=["AI Integration"])

# Instantiate the analyzer (in-memory)
analyzer = SkillGapAnalyzer()

@router.get(
    "/skill-gap",
    response_model=SkillGapResult,
    summary="Get AI-powered skill gap analysis and learning path",
    dependencies=[Depends(require_role(["student", "tpo"]))],
)
async def get_skill_gap(
    target_role: str = Query(..., description="The role the student is aiming for (e.g., 'Data Analyst')"),
    student_id: str | None = Query(None, description="TPOs can provide a student ID. If omitted, uses current user ID."),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # Determine which student we are analyzing
    analyzed_id = student_id if (student_id and current_user["role"] == "tpo") else current_user["_id"]

    cache_key = f"skill_gap:{analyzed_id}:{target_role}"
    cached_result = await cache_get(cache_key)
    if cached_result:
        return cached_result

    try:
         result = await analyzer.analyze(
             student_id=analyzed_id,
             target_role=target_role,
             db=db
         )
         # analyze returns a Pydantic model (SkillGapResult). Serialize to dict for cache.
         response_data = result.model_dump()
         await cache_set(cache_key, response_data, ttl_seconds=86400)
         return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during AI analysis: {str(e)}"
        )

# Instantiate the Agent
from services.ai.placement_bot import PlacementBot, set_tool_db

agent_bot = PlacementBot()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    message: str
    history: list[ChatMessage]
    session_id: str = "default_session"

@router.post(
    "/chat",
    summary="Interact with PlacementBot",
    dependencies=[Depends(require_role(["student", "alumni", "tpo"]))],
)
@limiter.limit("20/minute")
async def chat_with_bot(
    request: Request,
    payload: ChatPayload,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # Pass db reference so tools can access mongodb
    set_tool_db(db)
    
    # Send history as dicts for the service to parse
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.history]
    
    reply = await agent_bot.chat(
        user_id=current_user["_id"],
        message=payload.message,
        history_payload=history_dicts
    )
    
    return {"reply": reply}
