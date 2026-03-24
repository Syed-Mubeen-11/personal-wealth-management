from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/wealth_db"
    SECRET_KEY:   str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM:    str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Redis / Celery
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"

    # Market Data APIs
    ALPHA_VANTAGE_API_KEY: Optional[str] = "demo"
    YAHOO_FINANCE_ENABLED: bool = True

    class Config:
        env_file = ".env"
        extra    = "ignore"


settings = Settings()
