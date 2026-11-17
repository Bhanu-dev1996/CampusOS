from uuid import UUID

from app.api.context import AuthContext
from app.core.constants import AppRole
from app.core.errors import AppError


def is_platform_super_admin(ctx: AuthContext) -> bool:
    return AppRole.SUPER_ADMIN in ctx.roles and ctx.active_role == AppRole.SUPER_ADMIN


def assert_same_tenant(ctx: AuthContext, resource_tenant_id: UUID | None) -> None:
    """Hide cross-tenant resources as 404 (US-1.2)."""
    if is_platform_super_admin(ctx):
        return
    if ctx.tenant_id is None or resource_tenant_id is None:
        raise AppError("NOT_FOUND", "Resource not found", status_code=404)
    if resource_tenant_id != ctx.tenant_id:
        raise AppError("NOT_FOUND", "Resource not found", status_code=404)