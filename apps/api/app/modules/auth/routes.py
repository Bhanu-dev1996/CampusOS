from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.core.errors import AppError
from app.core.security import create_access_token
from app.modules.auth.schemas import LoginRequest, MeResponse, SwitchRoleRequest, TokenResponse
from app.modules.auth.service import authenticate_user, issue_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: DbSession) -> TokenResponse:
    user, roles, active = await authenticate_user(
        session,
        email=body.email.lower(),
        password=body.password,
        tenant_subdomain=body.tenant_subdomain.lower(),
    )
    bundle = issue_token(user, roles, active)
    return TokenResponse(access_token=bundle.access_token, expires_in=bundle.expires_in)


@router.get("/me", response_model=MeResponse)
async def me(ctx: CurrentUser) -> MeResponse:
    return MeResponse(
        id=ctx.user.id,
        email=ctx.user.email,
        full_name=ctx.user.full_name,
        tenant_id=ctx.user.tenant_id,
        roles=ctx.roles,
        active_role=ctx.active_role,
    )


@router.post("/switch-role", response_model=TokenResponse)
async def switch_role(body: SwitchRoleRequest, ctx: CurrentUser) -> TokenResponse:
    if body.active_role not in ctx.roles:
        raise AppError("FORBIDDEN", "Role not assigned", status_code=403)

    token = create_access_token(
        user_id=ctx.user_id,
        tenant_id=ctx.tenant_id,
        roles=ctx.roles,
        active_role=body.active_role,
    )
    from app.core.config import get_settings

    settings = get_settings()
    return TokenResponse(
        access_token=token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/logout")
async def logout() -> dict[str, str]:
    return {"status": "logged_out"}