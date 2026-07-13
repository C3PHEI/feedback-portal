$srcPath     = "C:\Apps\feedbackhub-src"
$publishPath = "C:\Apps\feedbackhub"
$frontendPath = "$srcPath\frontend"
$wwwrootPath  = "$srcPath\backend\feedbackhub\feedbackhub\wwwroot"
$port        = 5185

Write-Host "== Pull neuester Code =="
Set-Location $srcPath
git pull

Write-Host "== Frontend bauen =="
Set-Location $frontendPath
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "-- node_modules fehlt, npm install --"
    cmd /c "npm install"
}
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "FEHLER: Frontend-Build fehlgeschlagen — Abbruch." -ForegroundColor Red
    exit 1
}

Write-Host "== Frontend nach wwwroot kopieren =="
Remove-Item $wwwrootPath -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $wwwrootPath | Out-Null
Copy-Item "$frontendPath\dist\*" $wwwrootPath -Recurse -Force

Write-Host "== Publish =="
Set-Location $srcPath
dotnet publish ".\backend\feedbackhub\feedbackhub\feedbackhub.csproj" -c Release -o $publishPath

Write-Host "== Laufenden Prozess stoppen =="
$conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force
    Start-Sleep -Seconds 2
}

Write-Host "== Neustart auf Port $port =="
$env:ASPNETCORE_URLS = "http://0.0.0.0:$port"

Start-Process -FilePath "dotnet" `
    -ArgumentList "$publishPath\feedbackhub.dll" `
    -WorkingDirectory $publishPath `
    -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host "== Check =="
$check = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "OK: Backend laeuft auf Port $port" -ForegroundColor Green
} else {
    Write-Host "FEHLER: Backend ist NICHT erreichbar auf Port $port — appsettings.json/Connection-String pruefen!" -ForegroundColor Red
}
