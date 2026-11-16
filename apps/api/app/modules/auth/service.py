from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.constants import AppRole
from app.core.errors import AppError
from app.core.security import create_access_token, verify_password
from app.db.session import set_tenant_on_session
from app.models.tenant import Tenant
from app.models.user import User


class TokenBundle:
    def __init__(self, access_token: str, expires_in: int) -> None:
        self.access_token = access_token
        self.expires_in = expires_in


async def authenticate_user(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    tenant_subdomain: str,
) -> tuple[User, list[AppRole], AppRole]:
    tenant_result = await session.execute(
        select(Tenant).where(Tenant.subdomain == tenant_subdomain)
    )
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        raise AppError("UNAUTHENTICATED", "Invalid credentials", status_code=401)

    await set_tenant_on_session(session, tenant.id)

    result = await session.execute(
        select(User)
        .where(User.email == email.lower(), User.tenant_id == tenant.id)
        .options(selectinload(User.roles))
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise AppError("UNAUTHENTICATED", "Invalid credentials", status_code=401)

    roles = [AppRole(r.role) for r in user.roles if r.role in AppRole._value2member_map_]
    if not roles:
        raise AppError("FORBIDDEN", "No roles assigned", status_code=403)

    active = AppRole.PRINCIPAL if AppRole.PRINCIPAL in roles else roles[0]
    return user, roles, active


def issue_token(user: User, roles: list[AppRole], active_role: AppRole) -> TokenBundle:
    settings = get_settings()
    token = create_access_token(
        user_id=user.id,
        tenant_id=user.tenant_id,
        roles=roles,
        active_role=active_role,
    )
    return TokenBundle(access_token=token, expires_in=settings.access_token_expire_minutes * 60)