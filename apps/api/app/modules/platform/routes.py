from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.deps import AuthContext, DbSession, require_roles
from app.core.constants import AppRole
from app.core.errors import AppError
from app.core.security import hash_password
from app.models.tenant import Tenant
from app.models.user import User, UserTenantRole
from app.modules.platform.schemas import TenantCreate, TenantResponse

router = APIRouter(prefix="/platform", tags=["platform"])

SuperAdminCtx = Annotated[AuthContext, Depends(require_roles(AppRole.SUPER_ADMIN))]


@router.post("/tenants", response_model=TenantResponse, status_code=201)
async def create_tenant(
    body: TenantCreate,
    session: DbSession,
    _admin: SuperAdminCtx,
) -> Tenant:
    existing = await session.execute(select(Tenant).where(Tenant.subdomain == body.subdomain))
    if existing.scalar_one_or_none():
        raise AppError("DUPLICATE_RESOURCE", "Subdomain already in use", status_code=409)

    tenant = Tenant(
        name=body.name,
        subdomain=body.subdomain.lower(),
        academic_year=body.academic_year,
    )
    session.add(tenant)
    await session.flush()

    principal = User(
        tenant_id=tenant.id,
        email=body.principal_email.lower(),
        password_hash=hash_password("ChangeMe123!"),
        full_name="Institution Principal",
    )
    session.add(principal)
    await session.flush()
    session.add(
        UserTenantRole(
            tenant_id=tenant.id,
            user_id=principal.id,
            role=AppRole.PRINCIPAL.value,
        )
    )
    await session.commit()
    await session.refresh(tenant)
    return tenant


@router.get("/tenants", response_model=list[TenantResponse])
async def list_tenants(
    session: DbSession,
    _admin: SuperAdminCtx,
) -> list[Tenant]:
    result = await session.execute(select(Tenant).order_by(Tenant.created_at.desc()))
    return list(result.scalars().all())