$ErrorActionPreference = "Stop"

$triggerResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/market-refresh" -Method Post -UseBasicParsing
$trigger = $triggerResponse.Content | ConvertFrom-Json
$taskId = $trigger.task_id

Write-Output ("Triggered task: {0}" -f $taskId)

$maxAttempts = 30
for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 3

    $statusResponse = Invoke-WebRequest -Uri ("http://127.0.0.1:8000/api/refresh/status/{0}" -f $taskId) -UseBasicParsing
    $status = $statusResponse.Content | ConvertFrom-Json

    if ($status.state -eq "SUCCESS") {
        Write-Output ($status | ConvertTo-Json -Depth 8)
        exit 0
    }

    if ($status.state -eq "FAILURE") {
        Write-Output ($status | ConvertTo-Json -Depth 8)
        exit 1
    }

    Write-Output ("Attempt {0}/{1}: state={2}" -f $i, $maxAttempts, $status.state)
}

Write-Output ("Timed out waiting for task completion: {0}" -f $taskId)
exit 2
