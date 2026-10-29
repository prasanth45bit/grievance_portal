# PowerShell Stopper for Civic Vision Service
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ScriptDir "logs\vision_service.pid"

if (-not (Test-Path $PidFile)) {
    Write-Host "No active PID file found. Checking for running Python vision processes on port 8001..." -ForegroundColor Yellow
} else {
    $PidToKill = Get-Content $PidFile
    try {
        Stop-Process -Id $PidToKill -Force -ErrorAction Stop
        Write-Host "Stopped Vision Service process with PID: $PidToKill" -ForegroundColor Green
    } catch {
        Write-Host "Process with PID $PidToKill was not running." -ForegroundColor Yellow
    }
    Remove-Item -Path $PidFile -Force -ErrorAction SilentlyContinue
}

# Kill any remaining process bound to port 8001
$PortProcess = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
if ($PortProcess) {
    Stop-Process -Id $PortProcess.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Killed process holding port 8001." -ForegroundColor Green
}
Write-Host "Vision Service is stopped." -ForegroundColor White
