$srcPath     = "C:\Apps\feedbackhub-src"
$publishPath = "C:\Apps\feedbackhub-api"
$port        = 5185

Write-Host "== Pull neuester Code =="
Set-Location $srcPath
git pull

Write-Host "== Publish =="
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
