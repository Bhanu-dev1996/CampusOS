from collections.abc import AsyncGenerator, Callable
from dataclasses import dataclass
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import AppRole
from app.core.errors import AppError
from app.core.security import decode_access_token
from app.db.session import get_session, set_tenant_on_session
from app.models.user import User, UserTenantRole

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthContext:
    user_id: UUID
    tenant_id: UUID | None
    roles: list[AppRole]
    active_role: AppRole
    user: User


async def get_db(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        if credentials:
            claims = decode_access_token(credentials.credentials)
            tid = claims.get("tenant_id")
            if tid:
                await set_tenant_on_session(session, UUID(tid))
        yield session


async def get_auth_context(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> AuthContext:
    if not credentials:
        raise AppError("UNAUTHENTICATED", "Authentication required", status_code=401)

    claims = decode_access_token(credentials.credentials)
    user_id = UUID(claims["sub"])
    tenant_raw = claims.get("tenant_id")
    tenant_id = UUID(tenant_raw) if tenant_raw else None
    roles = [AppRole(r) for r in claims.get("roles", []) if r in AppRole._value2member_map_]
    active_role = AppRole(claims.get("active_role", roles[0] if roles else AppRole.STUDENT))

    if active_role not in roles:
        raise AppError("FORBIDDEN", "Active role is not assigned to this user", status_code=403)

    result = await session.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.roles))
    )
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise AppError("UNAUTHENTICATED", "User not found or inactive", status_code=401)

    if tenant_id and user.tenant_id and user.tenant_id != tenant_id:
        raise AppError("FORBIDDEN", "Token tenant does not match user", status_code=403)

    return AuthContext(
        user_id=user_id,
        tenant_id=tenant_id,
        roles=roles,
        active_role=active_role,
        user=user,
    )


def require_roles(*allowed: AppRole) -> Callable[..., AuthContext]:
    async def checker(ctx: Annotated[AuthContext, Depends(get_auth_context)]) -> AuthContext:
        if ctx.active_role not in allowed and AppRole.SUPER_ADMIN not in ctx.roles:
            raise AppError("FORBIDDEN", "Insufficient permissions", status_code=403)
        return ctx

    return checker


async def get_optional_tenant_header(
    x_tenant_id: Annotated[str | None, Header(alias="X-Tenant-Id")] = None,
) -> UUID | None:
    if not x_tenant_id:
        return None
    try:
        return UUID(x_tenant_id)
    except ValueError as exc:
        raise AppError("VALIDATION_ERROR", "Invalid X-Tenant-Id header", status_code=400) from exc


DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[AuthContext, Depends(get_auth_context)]