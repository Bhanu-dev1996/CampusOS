import ssl

import certifi
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.config import Settings


def _ssl_connect_arg(settings: Settings) -> bool | ssl.SSLContext:
    if not settings.database_requires_ssl:
        return False

    verify = settings.effective_database_ssl_verify
    if verify:
        return ssl.create_default_context(cafile=certifi.where())

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def create_engine(settings: Settings) -> AsyncEngine:
    connect_args: dict = {}
    ssl_arg = _ssl_connect_arg(settings)
    if ssl_arg is not False:
        connect_args["ssl"] = ssl_arg

    kwargs: dict = {
        "pool_pre_ping": True,
        "echo": settings.app_env == "development",
    }
    if connect_args:
        kwargs["connect_args"] = connect_args
    return create_async_engine(settings.database_url, **kwargs)