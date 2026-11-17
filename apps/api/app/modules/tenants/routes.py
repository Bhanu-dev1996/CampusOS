from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import DbSession
from app.core.errors import AppError
from app.models.tenant import Tenant
from app.modules.platform.schemas import TenantPublicResponse

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/by-subdomain/{subdomain}", response_model=TenantPublicResponse)
async def resolve_tenant_by_subdomain(subdomain: str, session: DbSession) -> Tenant:
    """Resolve institution context from subdomain (login + future host-based routing)."""
    key = subdomain.lower().strip()
    if not key:
        raise AppError("VALIDATION_ERROR", "Subdomain is required", status_code=422)

    result = await session.execute(select(Tenant).where(Tenant.subdomain == key))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise AppError("NOT_FOUND", "No institution found for this subdomain", status_code=404)
    return tenant