from dataclasses import dataclass
from uuid import UUID

from app.core.constants import AppRole
from app.models.user import User


@dataclass
class AuthContext:
    user_id: UUID
    tenant_id: UUID | None
    roles: list[AppRole]
    active_role: AppRole
    user: User