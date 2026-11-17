from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class InvoiceCreate(BaseModel):
    invoice_number: str = Field(min_length=3, max_length=32)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class InvoiceResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    invoice_number: str
    amount: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}