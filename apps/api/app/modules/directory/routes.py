from uuid import UUID

from fastapi import APIRouter

from app.api.deps import DbSession, TenantMemberCtx
from app.core.errors import AppError
from app.core.tenant_guard import assert_same_tenant
from app.models.user import User
from app.modules.directory.schemas import UserPublicResponse

router = APIRouter(prefix="/directory", tags=["directory"])


@router.get("/users/{user_id}", response_model=UserPublicResponse)
async def get_user_by_id(
    user_id: UUID,
    session: DbSession,
    ctx: TenantMemberCtx,
) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise AppError("NOT_FOUND", "User not found", status_code=404)
    assert_same_tenant(ctx, user.tenant_id)
    return user