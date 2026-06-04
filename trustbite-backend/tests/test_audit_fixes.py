"""
Minimum test suite for TrustBite backend.

Tests:
  - App imports cleanly (catches model mapper conflicts like CRIT-02)
  - Auth endpoints: register, login, me, change-password
  - Security: admin role cannot be self-assigned at registration
  - Mess listing: public endpoint returns a list
  - Health check: returns 200 or 503 (not a crash)

Run with:
    pytest tests/ -v

Requirements (add to requirements-dev.txt):
    pytest>=8.0
    httpx>=0.27
    pytest-asyncio>=0.23
"""

import pytest
from fastapi.testclient import TestClient


# ─────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def app():
    """
    Import the FastAPI app. If CRIT-02 (mess.py copy-paste) or any
    import error exists, this fixture will fail immediately — giving
    a clear error before any test runs.
    """
    from app.main import app as _app
    return _app


@pytest.fixture(scope="session")
def client(app):
    """Synchronous TestClient — no async runtime needed."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture(scope="session")
def test_user_data():
    import uuid
    uid = uuid.uuid4().hex[:8]
    return {
        "full_name": f"Test User {uid}",
        "email": f"test_{uid}@example.com",
        "password": "Test@1234",
        "role": "student",
    }


@pytest.fixture(scope="session")
def registered_user(client, test_user_data):
    resp = client.post("/api/auth/register", json=test_user_data)
    assert resp.status_code == 201, f"Registration failed: {resp.text}"
    return test_user_data


@pytest.fixture(scope="session")
def access_token(client, registered_user):
    resp = client.post(
        "/api/auth/login",
        data={
            "username": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["data"]["access_token"]


# ─────────────────────────────────────────────────────────────────
# Startup / import tests
# ─────────────────────────────────────────────────────────────────

class TestStartup:
    def test_app_object_exists(self, app):
        """
        Verifies the FastAPI app can be imported without error.
        Catches CRIT-02 (model mapper conflict), CRIT-03 (logging
        crash), and any missing dependency at import time.
        """
        assert app is not None
        assert app.title == "TrustBite API"

    def test_all_models_importable(self):
        """Explicitly import every model to catch duplicate __tablename__ errors."""
        from app.models.user import User
        from app.models.mess import Mess
        from app.models.review import Review
        from app.models.favourite import Favourite
        from app.models.menu_item import MenuItem
        from app.models.token_blacklist import BlacklistedToken

        # The Mess model must NOT define class User (CRIT-02 regression guard)
        assert Mess.__tablename__ == "messes", (
            f"Mess.__tablename__ is '{Mess.__tablename__}', expected 'messes'. "
            "This indicates mess.py still contains a copy of user.py (CRIT-02)."
        )
        assert User.__tablename__ == "users"

    def test_settings_loadable(self):
        from app.core.config import settings
        assert settings.SECRET_KEY
        assert len(settings.SECRET_KEY) >= 32
        assert settings.ALGORITHM in ("HS256", "HS384", "HS512")


# ─────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────

class TestHealth:
    def test_root_returns_200(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        body = resp.json()
        assert body["service"] == "TrustBite API"

    def test_health_check_returns_valid_status(self, client):
        """
        Health check must return 200 (DB ok) or 503 (DB down) — never 500.
        MED-14 regression guard.
        """
        resp = client.get("/health")
        assert resp.status_code in (200, 503), (
            f"Health check returned unexpected status {resp.status_code}"
        )
        body = resp.json()
        assert "status" in body
        assert body["status"] in ("ok", "error")


# ─────────────────────────────────────────────────────────────────
# Auth endpoints
# ─────────────────────────────────────────────────────────────────

class TestAuth:
    def test_register_new_user(self, client):
        import uuid
        uid = uuid.uuid4().hex[:8]
        resp = client.post(
            "/api/auth/register",
            json={
                "full_name": f"New User {uid}",
                "email": f"newuser_{uid}@example.com",
                "password": "NewPass@99",
                "role": "student",
            },
        )
        assert resp.status_code == 201
        assert resp.json()["success"] is True

    def test_register_duplicate_email_returns_409(self, client, registered_user):
        resp = client.post("/api/auth/register", json=registered_user)
        assert resp.status_code == 409

    def test_login_returns_tokens(self, client, registered_user):
        resp = client.post(
            "/api/auth/login",
            data={
                "username": registered_user["email"],
                "password": registered_user["password"],
            },
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password_returns_401(self, client, registered_user):
        resp = client.post(
            "/api/auth/login",
            data={
                "username": registered_user["email"],
                "password": "WrongPass@99",
            },
        )
        assert resp.status_code == 401

    def test_me_returns_current_user(self, client, access_token, registered_user):
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["email"] == registered_user["email"]

    def test_me_without_token_returns_401(self, app):
        """Use a fresh client with no cookies to test unauthenticated access."""
        from fastapi.testclient import TestClient
        with TestClient(app, raise_server_exceptions=False) as fresh_client:
            resp = fresh_client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_change_password(self, client, access_token):
        resp = client.put(
            "/api/auth/change-password",
            json={"current_password": "Test@1234", "new_password": "NewTest@5678"},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        # Either 200 (success) or 400 (wrong current password if already changed)
        assert resp.status_code in (200, 400)


# ─────────────────────────────────────────────────────────────────
# Security: role escalation guard
# ─────────────────────────────────────────────────────────────────

class TestSecurity:
    def test_cannot_register_as_admin(self, client):
        """
        Registering with role='admin' must be rejected.
        Any 400, 409, or 422 is acceptable — what matters is NOT 201.
        """
        import uuid
        uid = uuid.uuid4().hex[:8]
        resp = client.post(
            "/api/auth/register",
            json={
                "full_name": "Evil Admin",
                "email": f"evil_{uid}@hacker.com",
                "password": "Hack@12345",
                "role": "admin",  # ← must be blocked
            },
        )
        assert resp.status_code != 201, (
            "SECURITY FAILURE: role='admin' was accepted at /register. "
            "An attacker can create their own admin account."
        )

    def test_unauthenticated_cannot_access_admin_stats(self, app):
        """Use a fresh client with no cookies to test unauthenticated access."""
        from fastapi.testclient import TestClient
        with TestClient(app, raise_server_exceptions=False) as fresh_client:
            resp = fresh_client.get("/api/admin/stats")
        assert resp.status_code == 401

    def test_student_cannot_access_admin_stats(self, client, access_token):
        resp = client.get(
            "/api/admin/stats",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 403

    def test_forged_jwt_returns_401(self, client):
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.fake.payload"},
        )
        assert resp.status_code == 401


# ─────────────────────────────────────────────────────────────────
# Mess public endpoints
# ─────────────────────────────────────────────────────────────────

class TestMessPublic:
    def test_list_messes_returns_list(self, client):
        resp = client.get("/api/messes/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_messes_respects_limit(self, client):
        resp = client.get("/api/messes/?limit=3")
        assert resp.status_code == 200
        assert len(resp.json()) <= 3

    def test_featured_messes(self, client):
        resp = client.get("/api/messes/featured")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_nonexistent_mess_returns_404(self, client):
        import uuid
        resp = client.get(f"/api/messes/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_invalid_mess_id_returns_422(self, client):
        """Passing a non-UUID mess_id must return 422, not 500."""
        resp = client.get("/api/messes/not-a-uuid")
        assert resp.status_code == 422
