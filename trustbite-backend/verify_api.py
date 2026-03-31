"""End-to-end API verification script for TrustBite backend."""
import urllib.request
import urllib.error
import json

BASE = "http://127.0.0.1:8000"
passed = 0
failed = 0

def test(name, url, method="GET", expect_status=200):
    global passed, failed
    try:
        req = urllib.request.Request(f"{BASE}{url}", method=method)
        r = urllib.request.urlopen(req)
        data = json.loads(r.read())
        if r.status == expect_status:
            print(f"  PASS  {name} -> {r.status}")
            passed += 1
            return data
        else:
            print(f"  FAIL  {name} -> got {r.status}, expected {expect_status}")
            failed += 1
            return data
    except urllib.error.HTTPError as e:
        if e.code == expect_status:
            print(f"  PASS  {name} -> {e.code} (expected)")
            passed += 1
            return json.loads(e.read()) if e.readable() else None
        else:
            print(f"  FAIL  {name} -> got {e.code}, expected {expect_status}")
            failed += 1
            return None
    except Exception as e:
        print(f"  FAIL  {name} -> {e}")
        failed += 1
        return None

print("=" * 60)
print("TrustBite API Verification")
print("=" * 60)

# 1. Health checks
print("\n--- Health Checks ---")
data = test("GET /", "/")
if data:
    print(f"         service={data.get('service')}, version={data.get('version')}")

test("GET /health", "/health")

# 2. Platform stats
print("\n--- Platform Stats ---")
data = test("GET /api/stats/platform", "/api/stats/platform")
if data:
    print(f"         messes={data.get('total_messes')}, students={data.get('total_students')}, reviews={data.get('total_reviews')}, avg_trust={data.get('avg_trust_score')}")

# 3. Messes - public
print("\n--- Messes (Public) ---")
data = test("GET /api/messes/", "/api/messes/")
if data:
    print(f"         returned {len(data)} messes")

data = test("GET /api/messes/featured", "/api/messes/featured")
if data:
    print(f"         returned {len(data)} featured messes")
    for m in data[:3]:
        print(f"           - {m['name']} (trust: {m.get('trust_score')})")

# 4. Search
print("\n--- Search ---")
data = test("GET /api/search/?q=Sai", "/api/search/?q=Sai")
if data:
    print(f"         search results: {len(data)}")

# 5. AI suggestions
print("\n--- AI Suggestions ---")
data = test("GET /api/ai/suggestions", "/api/ai/suggestions?min_trust=5.0")
if data:
    print(f"         AI returned {len(data)} suggestions")

# 6. Auth - need auth for some
print("\n--- Auth (401 expected without token) ---")
test("GET /api/auth/me (no token)", "/api/auth/me", expect_status=401)
test("GET /api/favourites/ (no token)", "/api/favourites/", expect_status=401)

# 7. Test registration
print("\n--- Registration ---")
import urllib.parse
reg_data = json.dumps({
    "full_name": "Test User",
    "email": "testverify@trustbite.in",
    "password": "Test@123",
    "role": "student",
    "college_name": "Test College"
}).encode()
try:
    req = urllib.request.Request(f"{BASE}/api/auth/register", data=reg_data, method="POST")
    req.add_header("Content-Type", "application/json")
    r = urllib.request.urlopen(req)
    user = json.loads(r.read())
    print(f"  PASS  POST /api/auth/register -> 201")
    print(f"         user_id={user['id']}, role={user['role']}")
    passed += 1
except urllib.error.HTTPError as e:
    body = json.loads(e.read())
    if e.code == 409:
        print(f"  PASS  POST /api/auth/register -> 409 (already exists, expected)")
        passed += 1
    else:
        print(f"  FAIL  POST /api/auth/register -> {e.code}: {body}")
        failed += 1

# 8. Test login
print("\n--- Login ---")
login_body = urllib.parse.urlencode({
    "username": "student@trustbite.in",
    "password": "Student@123"
}).encode()
try:
    req = urllib.request.Request(f"{BASE}/api/auth/login", data=login_body, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    r = urllib.request.urlopen(req)
    token_data = json.loads(r.read())
    token = token_data["access_token"]
    print(f"  PASS  POST /api/auth/login -> 200")
    print(f"         token_type={token_data['token_type']}, user={token_data['user']['full_name']}, role={token_data['user']['role']}")
    passed += 1

    # 9. Test authenticated endpoints
    print("\n--- Authenticated Endpoints ---")
    req = urllib.request.Request(f"{BASE}/api/auth/me")
    req.add_header("Authorization", f"Bearer {token}")
    r = urllib.request.urlopen(req)
    me = json.loads(r.read())
    print(f"  PASS  GET /api/auth/me -> {me['full_name']} ({me['role']})")
    passed += 1

    req = urllib.request.Request(f"{BASE}/api/favourites/")
    req.add_header("Authorization", f"Bearer {token}")
    r = urllib.request.urlopen(req)
    favs = json.loads(r.read())
    print(f"  PASS  GET /api/favourites/ -> {len(favs)} favourites")
    passed += 1

except urllib.error.HTTPError as e:
    print(f"  FAIL  Login -> {e.code}: {e.read().decode()}")
    failed += 1

print("\n" + "=" * 60)
print(f"Results: {passed} passed, {failed} failed")
print("=" * 60)
