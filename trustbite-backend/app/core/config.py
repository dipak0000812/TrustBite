from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = ""

    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v:
            raise ValueError("SECRET_KEY environment variable is not set.")
        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY is too short ({len(v)} chars). "
                "Minimum required length is 32 characters."
            )
        return v

    @field_validator('DATABASE_URL')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError("DATABASE_URL is not set.")
        allowed_prefixes = ("postgresql://", "postgresql+psycopg2://", "sqlite://")
        if not any(v.startswith(prefix) for prefix in allowed_prefixes):
            raise ValueError(
                f"DATABASE_URL protocol is invalid. "
                f"Must start with one of: {', '.join(allowed_prefixes)}"
            )
        return v

    @field_validator('ALGORITHM')
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        allowed = {"HS256", "HS384", "HS512", "RS256", "RS384", "RS512"}
        if v not in allowed:
            raise ValueError(f"ALGORITHM must be one of: {', '.join(allowed)}")
        return v

    @field_validator('ACCESS_TOKEN_EXPIRE_MINUTES')
    @classmethod
    def validate_expiry(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer.")
        return v

    @model_validator(mode='after')
    def check_prod_secrets(self) -> 'Settings':
        if self.ENVIRONMENT.lower() == "production":
            default_keys = {
                "supersecretkey-minimum-32-chars-change-in-production",
                "change-in-production"
            }
            if any(k in self.SECRET_KEY or self.SECRET_KEY == k for k in default_keys):
                raise ValueError("SECRET_KEY cannot contain default placeholder values in production.")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in .env without failing

settings = Settings()
