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

DEMO_TENANTS = [
    ("Horizon Institute of Technology", "horizon", "2025-26", "Asia/Kolkata"),
    ("Meridian School of Business", "meridian", "2025-26", "Asia/Kolkata"),
    ("Summit Polytechnic", "summit", "2024-25", "Asia/Kolkata"),
    ("Coastal Arts College", "coastal", "2025-26", "Asia/Kolkata"),
]

USERS = [
    ("admin@campusos.io", "Platform Super Admin", [AppRole.SUPER_ADMIN], "horizon"),
    ("principal@horizon.edu", "Dr. Meera Nair", [AppRole.PRINCIPAL], "horizon"),
    ("faculty@horizon.edu", "Prof. Arjun Verma", [AppRole.FACULTY], "horizon"),
    ("student@horizon.edu", "Aarav Mehta", [AppRole.STUDENT], "horizon"),
    ("parent@horizon.edu", "Priya Mehta", [AppRole.PARENT], "horizon"),
    ("finance@horizon.edu", "Rohan Desai", [AppRole.FINANCE_ADMIN], "horizon"),
    ("principal@meridian.edu", "Dr. Vikram Singh", [AppRole.PRINCIPAL], "meridian"),
    ("faculty@meridian.edu", "Prof. Neha Kapoor", [AppRole.FACULTY], "meridian"),
    ("principal@summit.edu", "Dr. Ananya Rao", [AppRole.PRINCIPAL], "summit"),
    ("principal@coastal.edu", "Dr. James Fernandes", [AppRole.PRINCIPAL], "coastal"),
]


async def ensure_tenant(
    session,
    name: str,
    subdomain: str,
    academic_year: str,
    timezone: str,
) -> Tenant:
    existing = (
        await session.execute(select(Tenant).where(Tenant.subdomain == subdomain))
    ).scalar_one_or_none()
    if existing:
        return existing
    tenant = Tenant(
        name=name,
        subdomain=subdomain,
        academic_year=academic_year,
        timezone=timezone,
    )
    session.add(tenant)
    await session.flush()
    print(f"Created tenant: {tenant.name} ({tenant.subdomain})")
    return tenant


async def main() -> None:
    async with AsyncSessionLocal() as session:
        tenants_by_sub: dict[str, Tenant] = {}
        for name, subdomain, academic_year, timezone in DEMO_TENANTS:
            tenants_by_sub[subdomain] = await ensure_tenant(
                session, name, subdomain, academic_year, timezone
            )

        for email, full_name, roles, subdomain in USERS:
            tenant = tenants_by_sub.get(subdomain)
            if not tenant:
                continue
            tenant_id = tenant.id

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
                        tenant_id=tenant.id,
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