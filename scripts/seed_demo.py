#!/usr/bin/env python3
"""Seed Horizon Institute demo tenant and role logins (MVP)."""

from __future__ import annotations

import asyncio
import os
import sys

# Allow running from repo root: python scripts/seed_demo.py
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
API_ROOT = os.path.join(ROOT, "apps", "api")
if API_ROOT not in sys.path:
    sys.path.insert(0, API_ROOT)

from sqlalchemy import select

from app.core.constants import AppRole
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import User, UserTenantRole

DEMO_PASSWORD = "CampusOS123!"

USERS = [
    ("admin@campusos.io", "Platform Super Admin", [AppRole.SUPER_ADMIN], "horizon"),
    ("principal@horizon.edu", "Dr. Meera Nair", [AppRole.PRINCIPAL], "horizon"),
    ("faculty@horizon.edu", "Prof. Arjun Verma", [AppRole.FACULTY], "horizon"),
    ("student@horizon.edu", "Aarav Mehta", [AppRole.STUDENT], "horizon"),
    ("parent@horizon.edu", "Priya Mehta", [AppRole.PARENT], "horizon"),
    ("finance@horizon.edu", "Rohan Desai", [AppRole.FINANCE_ADMIN], "horizon"),
]


async def main() -> None:
    async with AsyncSessionLocal() as session:
        horizon = (
            await session.execute(select(Tenant).where(Tenant.subdomain == "horizon"))
        ).scalar_one_or_none()
        if not horizon:
            horizon = Tenant(
                name="Horizon Institute of Technology",
                subdomain="horizon",
                academic_year="2025-26",
            )
            session.add(horizon)
            await session.flush()
            print(f"Created tenant: {horizon.name} ({horizon.subdomain})")

        for email, full_name, roles, subdomain in USERS:
            tenant_id = horizon.id

            existing = (
                await session.execute(
                    select(User).where(User.email == email, User.tenant_id == tenant_id)
                )
            ).scalar_one_or_none()
            if existing:
                continue

            user = User(
                tenant_id=tenant_id,
                email=email,
                full_name=full_name,
                password_hash=hash_password(DEMO_PASSWORD),
            )
            session.add(user)
            await session.flush()

            for role in roles:
                session.add(
                    UserTenantRole(
                        tenant_id=horizon.id,
                        user_id=user.id,
                        role=role.value,
                    )
                )

        await session.commit()

    print("\n--- Demo logins (subdomain: horizon unless noted) ---")
    print(f"Password for all: {DEMO_PASSWORD}\n")
    for email, full_name, roles, subdomain in USERS:
        sub = subdomain or "horizon"
        print(f"  {roles[0]:14}  {email}  (tenant: {sub})")


if __name__ == "__main__":
    asyncio.run(main())