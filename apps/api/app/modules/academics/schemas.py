from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DepartmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    code: str = Field(min_length=2, max_length=32, pattern=r"^[A-Z0-9_-]+$")


class DepartmentResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    code: str
    created_at: datetime

    model_config = {"from_attributes": True}