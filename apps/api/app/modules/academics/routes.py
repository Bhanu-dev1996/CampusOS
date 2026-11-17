from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.deps import AuthContext, DbSession, require_roles, require_tenant_member
from app.core.constants import AppRole
from app.core.errors import AppError
from app.core.tenant_guard import assert_same_tenant
from app.models.department import Department
from app.modules.academics.schemas import DepartmentCreate, DepartmentResponse

router = APIRouter(tags=["academics"])

PrincipalCtx = Annotated[AuthContext, Depends(require_roles(AppRole.PRINCIPAL))]
TenantCtx = Annotated[AuthContext, Depends(require_tenant_member)]


@router.post("/departments", response_model=DepartmentResponse, status_code=201)
async def create_department(
    body: DepartmentCreate,
    session: DbSession,
    ctx: TenantCtx,
    _principal: PrincipalCtx,
) -> Department:
    if ctx.tenant_id is None:
        raise AppError("FORBIDDEN", "Tenant context required", status_code=403)

    dup = await session.execute(
        select(Department).where(
            Department.tenant_id == ctx.tenant_id,
            Department.code == body.code.upper(),
        )
    )
    if dup.scalar_one_or_none():
        raise AppError("DUPLICATE_RESOURCE", "Department code already exists", status_code=409)

    row = Department(
        tenant_id=ctx.tenant_id,
        name=body.name.strip(),
        code=body.code.upper(),
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: UUID,
    session: DbSession,
    ctx: TenantCtx,
) -> Department:
    row = await session.get(Department, department_id)
    if not row:
        raise AppError("NOT_FOUND", "Department not found", status_code=404)
    assert_same_tenant(ctx, row.tenant_id)
    return row