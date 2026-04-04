"""Check production API data."""
import requests

BASE = "https://wealth-api-h5ag.onrender.com"

resp = requests.post(f"{BASE}/login", json={"email": "aabeltemp@gmail.com", "password": "Aabel@2003"}, timeout=60)
print("Login:", resp.status_code)
if resp.status_code != 200:
    print(resp.text[:300])
    exit()

token = resp.json()["access_token"]
h = {"Authorization": f"Bearer {token}"}

# Portfolio
r = requests.get(f"{BASE}/portfolio", headers=h, timeout=120)
print(f"\n/portfolio => {r.status_code}")
data = r.json()
print(f"  keys: {list(data.keys())}")
print(f"  positions count: {len(data.get('positions', []))}")
ov = data.get("overview", {})
print(f"  total_portfolio_value: {ov.get('total_portfolio_value', 'N/A')}")
print(f"  overall_gain_loss: {ov.get('overall_gain_loss', 'N/A')}")

# Summary
r2 = requests.get(f"{BASE}/summary", headers=h, timeout=30)
print(f"\n/summary => {r2.status_code}")
print(f"  {r2.json()}")
