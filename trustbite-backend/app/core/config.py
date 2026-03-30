from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in .env without failing

settings = Settings()
