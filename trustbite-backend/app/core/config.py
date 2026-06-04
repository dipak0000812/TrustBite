from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT ─────────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Password hashing ────────────────────────────────────────────
    # bcrypt work factor — increase every ~2 years as hardware improves
    BCRYPT_ROUNDS: int = 12

    # ── Runtime ─────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # ── CORS ────────────────────────────────────────────────────────
    CORS_ORIGINS: str = ""

    # ── Email (for verification + password reset) ────────────────────
    # Leave blank in development — falls back to console output
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_NAME: str = "TrustBite"
    EMAILS_FROM_EMAIL: str = "no-reply@trustbite.com"
    FRONTEND_URL: str = "http://localhost:5173"

    # ── Validators ──────────────────────────────────────────────────

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v:
            raise ValueError("SECRET_KEY environment variable is not set.")
        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY is too short ({len(v)} chars). "
                "Minimum required length is 32 characters. "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        return v

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError("DATABASE_URL is not set.")
        allowed = ("postgresql://", "postgresql+psycopg2://", "sqlite://")
        if not any(v.startswith(p) for p in allowed):
            raise ValueError(
                f"DATABASE_URL protocol is invalid. Must start with one of: {', '.join(allowed)}"
            )
        return v

    @field_validator("ALGORITHM")
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        allowed = {"HS256", "HS384", "HS512", "RS256", "RS384", "RS512"}
        if v not in allowed:
            raise ValueError(f"ALGORITHM must be one of: {', '.join(sorted(allowed))}")
        return v

    @field_validator("ACCESS_TOKEN_EXPIRE_MINUTES")
    @classmethod
    def validate_expiry(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer.")
        return v

    @field_validator("BCRYPT_ROUNDS")
    @classmethod
    def validate_bcrypt_rounds(cls, v: int) -> int:
        if not (4 <= v <= 31):
            raise ValueError("BCRYPT_ROUNDS must be between 4 and 31.")
        return v

    @model_validator(mode="after")
    def check_prod_secrets(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            dangerous = {
                "supersecretkey-minimum-32-chars-change-in-production",
                "change-in-production",
            }
            if any(k in self.SECRET_KEY or self.SECRET_KEY == k for k in dangerous):
                raise ValueError(
                    "SECRET_KEY cannot contain default placeholder values in production."
                )
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
