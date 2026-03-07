import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request

from core.dependencies import get_current_user, get_db, require_role
from models.notification import BroadcastRequest
from services.notification_service import broadcast_notification
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])
logger = logging.getLogger(__name__)


@router.post(
    "/broadcast",
    summary="Broadcast notifications to eligible students via n8n",
    dependencies=[Depends(require_role(["tpo"]))],
)
@limiter.limit("10/minute")
async def broadcast(
    request: Request,
    payload: BroadcastRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    TPO only: sends drive info + student emails to n8n webhook.
    n8n handles the actual email delivery via its Email (SMTP) node.
    """
    try:
        result = await broadcast_notification(db, payload.drive_id, payload.student_ids)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.error("Broadcast error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to dispatch notifications.",
        )

    return {
        "message": f"Notification {result['status']} to {result['count']} students.",
        **result,
    }
