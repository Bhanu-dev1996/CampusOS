from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import AuthContext, require_roles
from app.core.constants import AppRole

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

PrincipalCtx = Annotated[AuthContext, Depends(require_roles(AppRole.PRINCIPAL))]


@router.get("/principal")
async def principal_dashboard(_ctx: PrincipalCtx) -> dict:
    """MVP stub — replace with aggregated queries per API spec."""
    return {
        "attendance_today_percent": 92.4,
        "attendance_by_department": [],
        "fee_collected": 12500000.0,
        "fee_outstanding": 3200000.0,
        "classes_in_session": 18,
        "pending_attendance_submissions": 3,
    }