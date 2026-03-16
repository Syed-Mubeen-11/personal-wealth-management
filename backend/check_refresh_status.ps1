param(
    [Parameter(Mandatory = $true)]
    [string]$TaskId
)

$ErrorActionPreference = "Stop"

$response = Invoke-WebRequest -Uri ("http://127.0.0.1:8000/api/refresh/status/{0}" -f $TaskId) -UseBasicParsing
$response.Content
