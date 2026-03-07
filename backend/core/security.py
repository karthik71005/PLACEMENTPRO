import json
import logging

import firebase_admin
from firebase_admin import auth, credentials

from core.config import settings

logger = logging.getLogger(__name__)

# ── Firebase Admin SDK Initialization ─────────────────────────────────────────
def _init_firebase() -> None:
    """Initialize Firebase Admin SDK from the JSON stored in the env var."""
    if firebase_admin._apps:
        return  # Already initialized (e.g. in tests)
    try:
        service_account_info = json.loads(settings.firebase_service_account_json)

        # Fix: .env files double-escape \n to \\n inside the private_key string.
        # The PEM parser requires real newline characters, not the literal \n sequence.
        if "private_key" in service_account_info:
            service_account_info["private_key"] = (
                service_account_info["private_key"].replace("\\n", "\n")
            )

        cred = credentials.Certificate(service_account_info)
        # Include databaseURL for Firebase Realtime Database (Sprint 3 — live tracker sync)
        firebase_admin.initialize_app(cred, {
            "databaseURL": f"https://{service_account_info.get('project_id', 'placementproweb')}.firebaseio.com",
        })
        logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as exc:
        logger.error("Failed to initialize Firebase Admin SDK: %s", exc)
        raise


_init_firebase()


# ── Token Verification ────────────────────────────────────────────────────────
async def verify_firebase_token(token: str) -> dict:
    """
    Verify a Firebase ID token and return its decoded claims.

    Raises:
        ValueError: if token is invalid or expired.
    """
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except auth.ExpiredIdTokenError:
        raise ValueError("Firebase token has expired.")
    except auth.InvalidIdTokenError as exc:
        raise ValueError(f"Invalid Firebase token: {exc}")
    except Exception as exc:
        raise ValueError(f"Token verification failed: {exc}")
