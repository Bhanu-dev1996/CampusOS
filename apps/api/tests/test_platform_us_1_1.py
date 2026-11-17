import secrets

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.mark.integration
def test_resolve_tenant_by_subdomain():
    response = client.get("/v1/tenants/by-subdomain/horizon")
    assert response.status_code == 200
    body = response.json()
    assert body["subdomain"] == "horizon"
    assert "name" in body


@pytest.mark.integration
def test_resolve_unknown_subdomain_returns_404():
    response = client.get("/v1/tenants/by-subdomain/does-not-exist-xyz")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_create_tenant_requires_authentication():
    response = client.post(
        "/v1/platform/tenants",
        json={
            "name": "Test College",
            "subdomain": "testcollege",
            "academic_year": "2025-26",
            "principal_email": "principal@testcollege.edu",
        },
    )
    assert response.status_code == 401


@pytest.mark.integration
def test_super_admin_provisions_tenant():
    login = client.post(
        "/v1/auth/login",
        json={
            "email": "admin@campusos.io",
            "password": "CampusOS123!",
            "tenant_subdomain": "horizon",
        },
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    subdomain = f"e2e-{secrets.token_hex(4)}"

    create = client.post(
        "/v1/platform/tenants",
        json={
            "name": "E2E Test Institute",
            "subdomain": subdomain,
            "academic_year": "2025-26",
            "principal_email": f"principal@{subdomain}.edu",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create.status_code == 201, create.text
    body = create.json()
    assert body["subdomain"] == subdomain
    assert body["principal_onboarding"]["temporary_password"]
    assert body["principal_onboarding"]["principal_email"] == f"principal@{subdomain}.edu"

    resolve = client.get(f"/v1/tenants/by-subdomain/{subdomain}")
    assert resolve.status_code == 200
    assert resolve.json()["id"] == body["id"]

    principal_login = client.post(
        "/v1/auth/login",
        json={
            "email": f"principal@{subdomain}.edu",
            "password": body["principal_onboarding"]["temporary_password"],
            "tenant_subdomain": subdomain,
        },
    )
    assert principal_login.status_code == 200, principal_login.text