from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.core.constants import AppRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    tenant_subdomain: str = Field(min_length=1, max_length=63)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class SwitchRoleRequest(BaseModel):
    active_role: AppRole
    linked_student_id: UUID | None = None


class MeResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    tenant_id: UUID | None
    roles: list[AppRole]
    active_role: AppRole