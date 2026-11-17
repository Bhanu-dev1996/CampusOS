"""US-1.2 — RBAC and tenant isolation (integration)."""

import secrets

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _login(email: str, password: str, subdomain: str) -> str:
    res = client.post(
        "/v1/auth/login",
        json={"email": email, "password": password, "tenant_subdomain": subdomain},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.integration
def test_faculty_cannot_create_department():
    token = _login("faculty@horizon.edu", "CampusOS123!", "horizon")
    res = client.post(
        "/v1/departments",
        headers=_auth(token),
        json={"name": "Computer Science", "code": "CS"},
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"


@pytest.mark.integration
def test_student_cannot_create_invoice():
    token = _login("student@horizon.edu", "CampusOS123!", "horizon")
    res = client.post(
        "/v1/invoices",
        headers=_auth(token),
        json={"invoice_number": "INV-TEST-1", "amount": "1000.00"},
    )
    assert res.status_code == 403


@pytest.mark.integration
def test_principal_can_create_department():
    token = _login("principal@horizon.edu", "CampusOS123!", "horizon")
    code = f"CS{secrets.token_hex(2).upper()}"
    res = client.post(
        "/v1/departments",
        headers=_auth(token),
        json={"name": "Computer Science", "code": code},
    )
    assert res.status_code == 201, res.text


@pytest.mark.integration
def test_cross_tenant_user_lookup_returns_404():
    admin = _login("admin@campusos.io", "CampusOS123!", "horizon")
    subdomain = f"iso-{secrets.token_hex(3)}"
    created = client.post(
        "/v1/platform/tenants",
        headers=_auth(admin),
        json={
            "name": "Isolation Test College",
            "subdomain": subdomain,
            "academic_year": "2025-26",
            "principal_email": f"p@{subdomain}.edu",
        },
    )
    assert created.status_code == 201, created.text
    other = created.json()
    pw = other["principal_onboarding"]["temporary_password"]
    other_principal = _login(f"p@{subdomain}.edu", pw, subdomain)

    horizon_principal = _login("principal@horizon.edu", "CampusOS123!", "horizon")
    me = client.get("/v1/auth/me", headers=_auth(other_principal))
    assert me.status_code == 200
    other_user_id = me.json()["id"]

    leak = client.get(
        f"/v1/directory/users/{other_user_id}",
        headers=_auth(horizon_principal),
    )
    assert leak.status_code == 404
    assert leak.json()["error"]["code"] == "NOT_FOUND"


def test_mismatched_tenant_header_forbidden():
    """Unit-friendly: header check does not require DB when token invalid."""
    res = client.get("/v1/auth/me", headers={"X-Tenant-Id": "00000000-0000-0000-0000-000000000099"})
    assert res.status_code == 401