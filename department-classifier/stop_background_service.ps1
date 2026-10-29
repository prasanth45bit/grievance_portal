# PowerShell script to stop background Grievance Classifier service
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PidFile = "$ScriptDir\logs\service.pid"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Stopping Citizen Grievance Classifier Background Service  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$Stopped = $false

if (Test-Path $PidFile) {
    $SavedPid = Get-Content $PidFile
    if ($SavedPid) {
        $Proc = Get-Process -Id $SavedPid -ErrorAction SilentlyContinue
        if ($Proc) {
            Write-Host "Stopping Process with PID $SavedPid ($($Proc.ProcessName))..." -ForegroundColor Yellow
            Stop-Process -Id $SavedPid -Force
            $Stopped = $true
        }
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

# Also check for any process listening on port 8000
$PortConnection = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($PortConnection) {
    $PortPid = $PortConnection.OwningProcess | Select-Object -Unique
    foreach ($p in $PortPid) {
        if ($p -gt 4) {
            Write-Host "Stopping process holding port 8000 (PID: $p)..." -ForegroundColor Yellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            $Stopped = $true
        }
    }
}

if ($Stopped) {
    Write-Host "[SUCCESS] Service stopped." -ForegroundColor Green
} else {
    Write-Host "No running service was found on port 8000 or in PID file." -ForegroundColor DarkGray
}
