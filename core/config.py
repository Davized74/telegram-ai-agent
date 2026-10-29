from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./agenda.db"
    
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_ADMIN_ID: Optional[int] = None
    
    AI_PROVIDER: str = "openrouter"
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "google/gemini-2.5-flash-lite-preview-06-17"
    
    SECRET_KEY: str = "change-me-in-production"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    
    WEB_USERNAME: str = "admin"
    WEB_PASSWORD: str = "change-me"
    
    ENABLE_VOICE: bool = True
    ENABLE_SEMANTIC_SEARCH: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
