$ErrorActionPreference = "Stop"

$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/market/provider-status" -UseBasicParsing
$response.Content
