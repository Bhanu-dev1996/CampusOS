from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.config import Settings


def create_engine(settings: Settings) -> AsyncEngine:
    connect_args: dict = {}
    if settings.database_requires_ssl:
        connect_args["ssl"] = True

    kwargs: dict = {
        "pool_pre_ping": True,
        "echo": settings.app_env == "development",
    }
    if connect_args:
        kwargs["connect_args"] = connect_args
    return create_async_engine(settings.database_url, **kwargs)