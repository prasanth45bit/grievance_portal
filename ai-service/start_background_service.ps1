# PowerShell Background Runner for Civic Vision Service
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $ScriptDir "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$LogFile = Join-Path $LogDir "vision_service.log"
$PidFile = Join-Path $LogDir "vision_service.pid"

if (Test-Path $PidFile) {
    $ExistingPid = Get-Content $PidFile
    $Process = Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue
    if ($Process) {
        Write-Host "Vision Service is already running with PID: $ExistingPid" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Starting Civic Vision Service in background on port 8001..." -ForegroundColor Cyan
$Process = Start-Process -FilePath "py" -ArgumentList "-3.13 run_service.py --host 0.0.0.0 --port 8001" -WorkingDirectory $ScriptDir -RedirectStandardOutput $LogFile -RedirectStandardError $LogFile -PassThru -WindowStyle Hidden

$Process.Id | Out-File -FilePath $PidFile -Encoding ascii
Write-Host "Vision Service started successfully! PID: $($Process.Id)" -ForegroundColor Green
Write-Host "Logs: $LogFile" -ForegroundColor Gray
Write-Host "UI:   http://localhost:8001/ui" -ForegroundColor White
