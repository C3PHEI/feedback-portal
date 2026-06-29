# update.ps1 - Git Pull & Backend Update Script
# Ausfuehren: powershell -ExecutionPolicy Bypass -File update.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendProject = Join-Path $RepoRoot "backend\feedbackhub\feedbackhub"

Write-Host "=== Feedback Portal Update ===" -ForegroundColor Cyan

# 1. Git Pull
Write-Host "`n[1/3] Git pull..." -ForegroundColor Yellow
Set-Location $RepoRoot
git pull origin (git branch --show-current)
if ($LASTEXITCODE -ne 0) {
    Write-Host "Git pull fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
Write-Host "Git pull erfolgreich." -ForegroundColor Green

# 2. Backend restore & build
Write-Host "`n[2/3] dotnet restore & build..." -ForegroundColor Yellow
Set-Location $BackendProject
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "dotnet restore fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
dotnet build -c Release --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "dotnet build fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
Write-Host "Build erfolgreich." -ForegroundColor Green

# 3. Backend starten
Write-Host "`n[3/3] Backend starten auf Port 5185..." -ForegroundColor Yellow
Write-Host "Backend erreichbar unter: http://<SERVER-IP>:5185" -ForegroundColor Cyan
Write-Host "Stoppen mit Ctrl+C`n" -ForegroundColor Gray
$env:ASPNETCORE_URLS = "http://0.0.0.0:5185"
dotnet run
