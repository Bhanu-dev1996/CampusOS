from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TenantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    subdomain: str = Field(min_length=2, max_length=63, pattern=r"^[a-z0-9-]+$")
    academic_year: str = Field(min_length=4, max_length=32)
    principal_email: EmailStr
    timezone: str = Field(default="Asia/Kolkata", min_length=2, max_length=64)


class TenantResponse(BaseModel):
    id: UUID
    name: str
    subdomain: str
    academic_year: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TenantListResponse(TenantResponse):
    updated_at: datetime
    principal_email: str | None = None
    principal_name: str | None = None
    user_count: int = 0


class TenantPublicResponse(BaseModel):
    """Public metadata for login / subdomain resolution (US-1.1)."""

    id: UUID
    name: str
    subdomain: str

    model_config = {"from_attributes": True}


class PrincipalOnboardingInvite(BaseModel):
    principal_email: EmailStr
    temporary_password: str
    login_subdomain: str
    message: str = (
        "Temporary password issued. Email delivery is stubbed in MVP — share credentials securely."
    )


class TenantCreatedResponse(TenantResponse):
    principal_onboarding: PrincipalOnboardingInvite