"""Trigger seed on production Render backend, with retry until deploy is ready."""
import requests
import time
import sys

BASE = "https://wealth-api-h5ag.onrender.com"

# Login
print("Logging in to production...")
resp = requests.post(f"{BASE}/login", json={"email": "aabeltemp@gmail.com", "password": "Aabel@2003"}, timeout=60)
if resp.status_code != 200:
    print(f"Login failed: {resp.status_code} {resp.text[:200]}")
    sys.exit(1)

token = resp.json()["access_token"]
h = {"Authorization": f"Bearer {token}"}

# Try calling /api/seed — retry a few times in case Render hasn't finished deploying
MAX_RETRIES = 10
for attempt in range(1, MAX_RETRIES + 1):
    print(f"\nAttempt {attempt}: POST /api/seed ...")
    try:
        r = requests.post(f"{BASE}/api/seed", headers=h, timeout=120)
        print(f"  Status: {r.status_code}")
        if r.status_code == 200:
            print(f"  Result: {r.json()}")
            break
        elif r.status_code == 404:
            print("  Endpoint not found yet — Render may still be deploying.")
            if attempt < MAX_RETRIES:
                print("  Waiting 30s before retry...")
                time.sleep(30)
        else:
            print(f"  Error: {r.text[:500]}")
            break
    except requests.exceptions.Timeout:
        print("  Timeout — server might be restarting")
        if attempt < MAX_RETRIES:
            print("  Waiting 30s...")
            time.sleep(30)
    except Exception as e:
        print(f"  Exception: {e}")
        break
else:
    print("\nFailed after all retries.")
    sys.exit(1)

# Verify portfolio now has data
print("\nVerifying /portfolio ...")
r2 = requests.get(f"{BASE}/portfolio", headers=h, timeout=120)
data = r2.json()
positions = data.get("positions", [])
ov = data.get("overview", {})
print(f"  Positions: {len(positions)}")
print(f"  Portfolio value: {ov.get('total_portfolio_value', 'N/A')}")
print(f"  Gain/Loss: {ov.get('overall_gain_loss', 'N/A')}")

print("\nDone!")
