from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.deps import AuthContext, DbSession, require_roles, require_tenant_member
from app.core.constants import AppRole
from app.core.errors import AppError
from app.core.tenant_guard import assert_same_tenant
from app.models.fee_invoice import FeeInvoice
from app.modules.finance.schemas import InvoiceCreate, InvoiceResponse

router = APIRouter(tags=["finance"])

FinanceCtx = Annotated[AuthContext, Depends(require_roles(AppRole.FINANCE_ADMIN, AppRole.PRINCIPAL))]
TenantCtx = Annotated[AuthContext, Depends(require_tenant_member)]


@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    body: InvoiceCreate,
    session: DbSession,
    ctx: TenantCtx,
    _finance: FinanceCtx,
) -> FeeInvoice:
    if ctx.tenant_id is None:
        raise AppError("FORBIDDEN", "Tenant context required", status_code=403)

    existing = await session.execute(
        select(FeeInvoice).where(
            FeeInvoice.tenant_id == ctx.tenant_id,
            FeeInvoice.invoice_number == body.invoice_number,
        )
    )
    if existing.scalar_one_or_none():
        raise AppError("DUPLICATE_RESOURCE", "Invoice number already exists", status_code=409)

    row = FeeInvoice(
        tenant_id=ctx.tenant_id,
        invoice_number=body.invoice_number,
        amount=body.amount,
        status="UNPAID",
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    session: DbSession,
    ctx: TenantCtx,
) -> FeeInvoice:
    row = await session.get(FeeInvoice, invoice_id)
    if not row:
        raise AppError("NOT_FOUND", "Invoice not found", status_code=404)
    assert_same_tenant(ctx, row.tenant_id)
    return row