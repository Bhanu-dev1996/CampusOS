from uuid import UUID

from pydantic import BaseModel


class UserPublicResponse(BaseModel):
    id: UUID
    tenant_id: UUID | None
    email: str
    full_name: str

    model_config = {"from_attributes": True}