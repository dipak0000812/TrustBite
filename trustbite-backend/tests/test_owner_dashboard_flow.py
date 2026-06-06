import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app as _app

@pytest.fixture(scope="module")
def client():
    with TestClient(_app, raise_server_exceptions=False) as c:
        yield c

@pytest.fixture(scope="module")
def admin_token(client):
    # Try trustbite09@gmail.com first
    resp = client.post(
        "/api/auth/login",
        data={
            "username": "trustbite09@gmail.com",
            "password": "Trustbite@03",
        },
    )
    if resp.status_code == 200:
        return resp.json()["data"]["access_token"]
        
    # Fallback to admin@trustbite.in
    resp = client.post(
        "/api/auth/login",
        data={
            "username": "admin@trustbite.in",
            "password": "Admin@123",
        },
    )
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json()["data"]["access_token"]

def test_owner_dashboard_mess_lifecycle(client, admin_token):
    # 1. Register a new owner
    uid = uuid.uuid4().hex[:8]
    owner_email = f"owner_{uid}@example.com"
    owner_password = "OwnerPass@123"
    
    register_resp = client.post(
        "/api/auth/register",
        json={
            "full_name": f"Test Owner {uid}",
            "email": owner_email,
            "password": owner_password,
            "role": "mess_owner",
        },
    )
    assert register_resp.status_code == 201, f"Owner registration failed: {register_resp.text}"
    
    # 2. Login as the owner
    login_resp = client.post(
        "/api/auth/login",
        data={
            "username": owner_email,
            "password": owner_password,
        },
    )
    assert login_resp.status_code == 200, f"Owner login failed: {login_resp.text}"
    owner_token = login_resp.json()["data"]["access_token"]
    
    # 3. Verify owner starts with no messes
    mine_headers = {"Authorization": f"Bearer {owner_token}"}
    mine_resp = client.get("/api/messes/owner/mine", headers=mine_headers)
    assert mine_resp.status_code == 200
    assert len(mine_resp.json()) == 0
    
    # 4. Register a mess as the owner (initially is_active=False)
    mess_name = f"Test Mess {uid}"
    create_resp = client.post(
        "/api/messes/",
        json={
            "name": mess_name,
            "description": "Delicious food testing",
            "address": "456 Test Lane",
            "city": "Shirpur",
            "pincode": "425405",
            "cuisine_type": "Punjabi",
            "price_per_meal": 90.0,
            "is_veg": True,
            "owner_phone": "9999999999",
        },
        headers=mine_headers,
    )
    assert create_resp.status_code == 201, f"Mess creation failed: {create_resp.text}"
    mess_id = create_resp.json()["id"]
    assert create_resp.json()["is_active"] is False
    
    # 5. Verify the mess shows up in the owner's dashboard query as inactive/pending
    mine_resp = client.get("/api/messes/owner/mine", headers=mine_headers)
    assert mine_resp.status_code == 200
    assert len(mine_resp.json()) == 1
    assert mine_resp.json()[0]["id"] == mess_id
    assert mine_resp.json()[0]["is_active"] is False
    
    # 5a. CRITICAL VERIFICATION: Student Discovery must NOT show the mess before approval
    discovery_resp = client.get("/api/messes/")
    assert discovery_resp.status_code == 200
    discovery_list = discovery_resp.json()
    assert not any(m["id"] == mess_id for m in discovery_list), "Mess must NOT be visible to students before approval"
    
    # 5b. CRITICAL VERIFICATION: Admin Dashboard pending tab must show the mess before approval
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    pending_resp = client.get("/api/admin/messes/pending", headers=admin_headers)
    assert pending_resp.status_code == 200
    pending_list = pending_resp.json()
    assert any(m["id"] == mess_id for m in pending_list), "Mess must show up in admin pending/awaiting list before approval"
    
    # 6. Admin approves the mess
    approve_resp = client.patch(
        f"/api/admin/messes/{mess_id}/approve",
        json={"is_active": True},
        headers=admin_headers,
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["is_active"] is True
    
    # 7. Verify the mess shows up in the owner's dashboard query as active
    mine_resp = client.get("/api/messes/owner/mine", headers=mine_headers)
    assert mine_resp.status_code == 200
    assert len(mine_resp.json()) == 1
    assert mine_resp.json()[0]["is_active"] is True
    
    # 7a. CRITICAL VERIFICATION: Student Discovery MUST show the mess after approval
    discovery_resp = client.get("/api/messes/")
    assert discovery_resp.status_code == 200
    discovery_list = discovery_resp.json()
    assert any(m["id"] == mess_id for m in discovery_list), "Mess must be visible to students after approval"
    
    # 7b. CRITICAL VERIFICATION: Admin Dashboard pending tab must NOT show the mess after approval
    pending_resp = client.get("/api/admin/messes/pending", headers=admin_headers)
    assert pending_resp.status_code == 200
    pending_list = pending_resp.json()
    assert not any(m["id"] == mess_id for m in pending_list), "Mess must NOT be in admin pending/awaiting list after approval"
    
    # 8. Admin deactivates the mess
    deactivate_resp = client.patch(
        f"/api/admin/messes/{mess_id}/approve",
        json={"is_active": False},
        headers=admin_headers,
    )
    assert deactivate_resp.status_code == 200
    assert deactivate_resp.json()["is_active"] is False
    
    # 9. CRITICAL CHECK: Deactivated mess must still remain visible to the owner
    mine_resp = client.get("/api/messes/owner/mine", headers=mine_headers)
    assert mine_resp.status_code == 200
    assert len(mine_resp.json()) == 1
    assert mine_resp.json()[0]["id"] == mess_id
    assert mine_resp.json()[0]["is_active"] is False
