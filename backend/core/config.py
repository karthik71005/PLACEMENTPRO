from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
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

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
