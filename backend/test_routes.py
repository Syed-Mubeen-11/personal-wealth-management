import urllib.request
import urllib.error
import json

# Test different host variations
urls = [
    'http://127.0.0.1:8000/investments/',
    'http://localhost:8000/investments/',
]

data = json.dumps({'asset_type': 'stock', 'symbol': 'AAPL', 'units': 10, 'avg_buy_price': 150.0}).encode('utf-8')

for url in urls:
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        resp = urllib.request.urlopen(req)
        print(f"POST {url} -> {resp.getcode()}")
    except urllib.error.HTTPError as e:
        print(f"POST {url} -> {e.code}: {e.read().decode()}")

# Also try without trailing slash
url_no_slash = 'http://127.0.0.1:8000/investments'
req = urllib.request.Request(url_no_slash, data=data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    resp = urllib.request.urlopen(req)
    print(f"POST {url_no_slash} -> {resp.getcode()}")
except urllib.error.HTTPError as e:
    print(f"POST {url_no_slash} -> {e.code}: {e.read().decode()}")




