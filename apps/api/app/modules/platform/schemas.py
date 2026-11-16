from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TenantCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    subdomain: str = Field(min_length=2, max_length=63, pattern=r"^[a-z0-9-]+$")
    academic_year: str = Field(min_length=4, max_length=32)
    principal_email: EmailStr


class TenantResponse(BaseModel):
    id: UUID
    name: str
    subdomain: str
    academic_year: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}