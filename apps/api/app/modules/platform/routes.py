from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.api.deps import AuthContext, DbSession, require_roles
from app.core.constants import AppRole
from app.core.errors import AppError
from app.core.security import hash_password
from app.core.tenant_guard import assert_same_tenant
from app.models.tenant import Tenant
from app.models.user import User, UserTenantRole
from app.modules.platform.schemas import (
    PrincipalOnboardingInvite,
    TenantCreate,
    TenantCreatedResponse,
    TenantListResponse,
    TenantResponse,
)
from app.modules.platform.service import (
    dispatch_principal_onboarding_invite,
    generate_principal_temporary_password,
)

router = APIRouter(prefix="/platform", tags=["platform"])

SuperAdminCtx = Annotated[AuthContext, Depends(require_roles(AppRole.SUPER_ADMIN))]


@router.post("/tenants", response_model=TenantCreatedResponse, status_code=201)
async def create_tenant(
    body: TenantCreate,
    session: DbSession,
    _admin: SuperAdminCtx,
) -> TenantCreatedResponse:
    subdomain = body.subdomain.lower().strip()
    existing = await session.execute(select(Tenant).where(Tenant.subdomain == subdomain))
    if existing.scalar_one_or_none():
        raise AppError("DUPLICATE_RESOURCE", "Subdomain already in use", status_code=409)

    temporary_password = generate_principal_temporary_password()

    tenant = Tenant(
        name=body.name.strip(),
        subdomain=subdomain,
        academic_year=body.academic_year.strip(),
        timezone=body.timezone.strip(),
    )
    session.add(tenant)
    await session.flush()

    principal = User(
        tenant_id=tenant.id,
        email=body.principal_email.lower(),
        password_hash=hash_password(temporary_password),
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

    dispatch_principal_onboarding_invite(
        tenant_name=tenant.name,
        subdomain=tenant.subdomain,
        principal_email=principal.email,
        temporary_password=temporary_password,
    )

    return TenantCreatedResponse(
        id=tenant.id,
        name=tenant.name,
        subdomain=tenant.subdomain,
        academic_year=tenant.academic_year,
        timezone=tenant.timezone,
        created_at=tenant.created_at,
        principal_onboarding=PrincipalOnboardingInvite(
            principal_email=principal.email,
            temporary_password=temporary_password,
            login_subdomain=tenant.subdomain,
        ),
    )


@router.get("/tenants", response_model=list[TenantListResponse])
async def list_tenants(
    session: DbSession,
    _admin: SuperAdminCtx,
) -> list[TenantListResponse]:
    result = await session.execute(select(Tenant).order_by(Tenant.created_at.desc()))
    tenants = list(result.scalars().all())
    if not tenants:
        return []

    tenant_ids = [t.id for t in tenants]

    count_rows = await session.execute(
        select(User.tenant_id, func.count(User.id))
        .where(User.tenant_id.in_(tenant_ids))
        .group_by(User.tenant_id)
    )
    user_counts = {row[0]: row[1] for row in count_rows.all()}

    principal_rows = await session.execute(
        select(User.tenant_id, User.email, User.full_name)
        .join(UserTenantRole, UserTenantRole.user_id == User.id)
        .where(
            User.tenant_id.in_(tenant_ids),
            UserTenantRole.role == AppRole.PRINCIPAL.value,
        )
    )
    principals: dict[UUID, tuple[str, str]] = {
        row[0]: (row[1], row[2]) for row in principal_rows.all()
    }

    return [
        TenantListResponse(
            id=t.id,
            name=t.name,
            subdomain=t.subdomain,
            academic_year=t.academic_year,
            timezone=t.timezone,
            created_at=t.created_at,
            updated_at=t.updated_at,
            user_count=user_counts.get(t.id, 0),
            principal_email=principals.get(t.id, (None, None))[0],
            principal_name=principals.get(t.id, (None, None))[1],
        )
        for t in tenants
    ]


@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: UUID,
    session: DbSession,
    admin: SuperAdminCtx,
) -> Tenant:
    result = await session.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise AppError("NOT_FOUND", "Tenant not found", status_code=404)
    assert_same_tenant(admin, tenant.id)
    return tenant