import os
import logging
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


def _debug_env() -> None:
    """Print which critical env vars are present at startup (values hidden)."""
    keys = [
        "MONGO_URI", "mongo_uri",
        "FIREBASE_SERVICE_ACCOUNT_JSON", "firebase_service_account_json",
        "MONGO_DB_NAME",
    ]
    status = {k: ("SET" if os.environ.get(k) else "MISSING") for k in keys}
    print(f"[config] ENV CHECK → {status}", flush=True)
    total = len(os.environ)
    print(f"[config] Total env vars visible: {total}", flush=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # MongoDB
    mongo_uri: str
    mongo_db_name: str = "placementpro"

    # Firebase
    firebase_service_account_json: str

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:5174"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # n8n
    n8n_webhook_url: str = ""

    # Email / SMS
    sendgrid_api_key: str = ""
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    # AI
    gemini_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_environment: str = ""
    pinecone_index_name: str = "placementpro-jd"

    # App
    log_level: str = "INFO"
    environment: str = "development"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    _debug_env()
    return Settings()


settings = get_settings()
