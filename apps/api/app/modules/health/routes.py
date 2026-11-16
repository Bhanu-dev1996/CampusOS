from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import DbSession
from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
async def ready(session: DbSession) -> dict[str, str | bool]:
    db_ok = False
    redis_ok = False

    try:
        await session.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    try:
        import redis.asyncio as redis

        client = redis.from_url(get_settings().redis_url)
        redis_ok = bool(await client.ping())
        await client.aclose()
    except Exception:
        redis_ok = False

    status = "ready" if db_ok and redis_ok else "degraded"
    return {"status": status, "database": db_ok, "redis": redis_ok}