# PowerShell script to run Grievance Classifier API as a background service on Windows
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Ensure logs directory exists
if (-not (Test-Path "$ScriptDir\logs")) {
    New-Item -ItemType Directory -Path "$ScriptDir\logs" | Out-Null
}

$LogFile = "$ScriptDir\logs\service.log"
$PythonExe = "py"
$PythonArgs = "-3.13 run_service.py --host 0.0.0.0 --port 8000"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Citizen Grievance Classifier Service in Background " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if already running on port 8000
$ExistingProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($ExistingProcess) {
    Write-Host "[WARNING] Port 8000 is already in use by PID: $($ExistingProcess.OwningProcess)" -ForegroundColor Yellow
    Write-Host "Run .\stop_background_service.ps1 first if you want to restart." -ForegroundColor Yellow
    exit
}

# Start background process
$Process = Start-Process -FilePath $PythonExe `
    -ArgumentList $PythonArgs `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError "$ScriptDir\logs\service_error.log" `
    -WindowStyle Hidden `
    -PassThru

# Save PID to file for easy management
$Process.Id | Out-File "$ScriptDir\logs\service.pid" -Force

Write-Host "[SUCCESS] Service launched successfully!" -ForegroundColor Green
Write-Host "PID:            $($Process.Id)"
Write-Host "Service URL:    http://localhost:8000"
Write-Host "Web Portal:     http://localhost:8000/ui"
Write-Host "Swagger Docs:   http://localhost:8000/docs"
Write-Host "Health Check:   http://localhost:8000/health"
Write-Host "Log Output:     $LogFile"
Write-Host ""
Write-Host "To stop the background service, run: .\stop_background_service.ps1" -ForegroundColor Cyan
