"""enable RLS on tenant-scoped identity tables

Revision ID: 20251116_0002
Revises: 20251116_0001
Create Date: 2025-11-16

"""

from typing import Sequence, Union

from alembic import op

revision: str = "20251116_0002"
down_revision: Union[str, None] = "20251116_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TENANT_MATCH = "NULLIF(current_setting('app.current_tenant_id', true), '')::uuid"
_USERS_POLICY = f"""
    tenant_id IS NULL
    OR tenant_id = {_TENANT_MATCH}
"""
_ROLES_POLICY = f"tenant_id = {_TENANT_MATCH}"


def upgrade() -> None:
    policies: list[tuple[str, str]] = [
        ("users", _USERS_POLICY),
        ("user_tenant_roles", _ROLES_POLICY),
    ]
    for table, expr in policies:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation_{table} ON {table}")
        op.execute(
            f"""
            CREATE POLICY tenant_isolation_{table} ON {table}
              USING ({expr.strip()})
              WITH CHECK ({expr.strip()})
            """
        )


def downgrade() -> None:
    for table in ("user_tenant_roles", "users"):
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation_{table} ON {table}")
        op.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")