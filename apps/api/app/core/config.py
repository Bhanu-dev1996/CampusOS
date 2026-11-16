from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    database_url: str = "postgresql+asyncpg://campusos:campusos@localhost:5432/campusos"
    """Use `postgresql+asyncpg://` (not `postgresql://`). Supabase: copy URI from Dashboard → Connect."""
    database_ssl: bool | None = None
    """Force SSL for asyncpg. Auto-enabled when host contains `supabase.co` or `pooler.supabase.com`."""

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "dev-only-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15

    cors_origins: str = "http://localhost:3000"

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        value = value.strip()
        if value.startswith("postgres://"):
            value = "postgresql+asyncpg://" + value.removeprefix("postgres://")
        elif value.startswith("postgresql://"):
            value = "postgresql+asyncpg://" + value.removeprefix("postgresql://")
        return value

    @property
    def database_requires_ssl(self) -> bool:
        if self.database_ssl is not None:
            return self.database_ssl
        host = self.database_url.lower()
        return "supabase.co" in host or "pooler.supabase.com" in host

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()